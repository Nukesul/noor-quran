import type { EditionPair, Surah, SurahSummary } from '../../types/quran';
import { DEFAULT_EDITIONS } from './editions';
import { alQuranCloudSource } from './sources/alQuranCloudSource';
import { bundledSource } from './sources/bundledSource';
import { quranEncSource } from './sources/quranEncSource';
import { QuranDataError, type QuranDataSource, type SurahRequest } from './types';

/**
 * The only Quran entry point the UI is allowed to know about.
 *
 * Sources are tried in order and the first one holding the surah wins. Today
 * that is:
 *
 *   bundled  →  alquran.cloud
 *
 * An offline cache slots in between them as a third source implementing the
 * same interface, with no change to this class or to the Reader:
 *
 *   bundled  →  cache  →  alquran.cloud
 *
 * A source returning `null` means "not mine"; a source that genuinely fails
 * throws, and the failure is surfaced rather than silently falling through —
 * quietly serving different text than the reader asked for would be worse than
 * showing an error.
 */
export class QuranService {
  constructor(private readonly sources: readonly QuranDataSource[]) {}

  /** Metadata for all 114 surahs. Bundled, so this never touches the network. */
  async getSurahIndex(): Promise<readonly SurahSummary[]> {
    const [primary] = this.sources;
    if (!primary) throw new Error('QuranService constructed with no sources');
    return primary.getSurahIndex();
  }

  /**
   * Returns the surah only if some source already holds it in memory.
   *
   * Lets the Reader paint bundled content on its first frame instead of
   * flashing a loading state. Returns null when the surah needs I/O.
   */
  getSurahSync(surahNumber: number, editions: EditionPair = DEFAULT_EDITIONS): Surah | null {
    const request: SurahRequest = { surahNumber, editions };

    for (const source of this.sources) {
      const surah = source.getSurahSync?.(request);
      if (surah) return surah;
    }
    return null;
  }

  async getSurah(
    surahNumber: number,
    options: { editions?: EditionPair; signal?: AbortSignal } = {},
  ): Promise<Surah> {
    const request: SurahRequest = {
      surahNumber,
      editions: options.editions ?? DEFAULT_EDITIONS,
      signal: options.signal,
    };

    for (const source of this.sources) {
      const surah = await source.getSurah(request);
      if (surah) return surah;
    }

    throw new QuranDataError(
      'not-found',
      'quran-service',
      `No source could provide surah ${surahNumber}`,
    );
  }
}

/**
 * Source order.
 *
 * Bundled first, so Al-Fatihah costs nothing. The two remote sources are
 * mutually exclusive — each declines edition pairs it does not carry — so their
 * relative order does not affect which text is returned. AlQuran.cloud is first
 * because it serves the default editions.
 */
export const quranService = new QuranService([
  bundledSource,
  alQuranCloudSource,
  quranEncSource,
]);
