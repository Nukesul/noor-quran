import { SURAH_INDEX } from '../../../constants/surahIndex';
import type { Surah, SurahSummary, Verse } from '../../../types/quran';
import { ARABIC_QURANENC, QURANENC_TRANSLATIONS } from '../editions';
import { QuranDataError, type QuranDataSource, type SurahRequest } from '../types';
import { fetchJson } from './fetchJson';

/**
 * QuranEnc adapter — Rowwad Translation Center's Russian translation.
 *
 * Serves the `ARABIC_QURANENC` + `RUSSIAN_ROWWAD` pair only; both arrive in the
 * same response. Any other combination returns null so the service moves on,
 * because this source cannot supply Tanzil's Arabic and must not substitute its
 * own for it.
 *
 * Not the default translation, and `RUSSIAN_ROWWAD` is marked
 * `permission-required` until QuranEnc confirms a version number. See
 * docs/07_Data.md.
 *
 * Notably free of the quirks the AlQuran.cloud adapter has to correct: ayah
 * boundaries are already right (2:1 is "الٓمٓ", not the Bismillah plus "الٓمٓ"),
 * and no BOM was observed.
 */

const BASE_URL = 'https://quranenc.com/api/v1';
const REQUEST_TIMEOUT_MS = 15_000;

const SOURCE_ID = 'quranenc';

/** Shape of the parts of the response we read. Every field arrives as a string. */
interface ApiAyah {
  sura: string;
  aya: string;
  arabic_text: string;
  translation: string;
  /** Present but empty on most ayahs. */
  footnotes?: string;
}

function isApiAyah(value: unknown): value is ApiAyah {
  if (typeof value !== 'object' || value === null) return false;
  const ayah = value as Partial<ApiAyah>;
  return (
    typeof ayah.sura === 'string' &&
    typeof ayah.aya === 'string' &&
    typeof ayah.arabic_text === 'string' &&
    typeof ayah.translation === 'string' &&
    (ayah.footnotes === undefined || typeof ayah.footnotes === 'string')
  );
}

/**
 * Defensive only — no BOM has been observed from this source, unlike
 * AlQuran.cloud's 1:1. Cheap insurance against an invisible character reaching
 * the Reader.
 */
function stripByteOrderMark(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

const SERVED_TRANSLATION_IDS = new Set(QURANENC_TRANSLATIONS.map((edition) => edition.id));

/**
 * QuranEnc serves its own Arabic paired with any of its catalogued
 * translations. The translation's edition id doubles as the API key.
 */
function servesRequestedEditions(request: SurahRequest): boolean {
  return (
    request.editions.arabic.id === ARABIC_QURANENC.id &&
    SERVED_TRANSLATION_IDS.has(request.editions.translation.id)
  );
}

export const quranEncSource: QuranDataSource = {
  id: SOURCE_ID,

  /** Metadata is bundled and already verified; no round trip needed. */
  async getSurahIndex(): Promise<readonly SurahSummary[]> {
    return SURAH_INDEX;
  },

  async getSurah(request: SurahRequest): Promise<Surah | null> {
    if (!servesRequestedEditions(request)) return null;

    const { surahNumber, editions, signal } = request;

    const summary = SURAH_INDEX.find((entry) => entry.number === surahNumber);
    if (!summary) return null;

    const url =
      `${BASE_URL}/translation/sura/` +
      `${encodeURIComponent(editions.translation.id)}/${surahNumber}`;

    const payload = await fetchJson(url, SOURCE_ID, REQUEST_TIMEOUT_MS, signal);

    const ayahs = (payload as { result?: unknown })?.result;
    if (!Array.isArray(ayahs) || !ayahs.every(isApiAyah)) {
      throw new QuranDataError(
        'malformed',
        SOURCE_ID,
        `Unexpected response shape for surah ${surahNumber}`,
      );
    }

    // The bundled index is the authority on ayah counts. A short response must
    // not be rendered as though it were a complete surah.
    if (ayahs.length !== summary.versesCount) {
      throw new QuranDataError(
        'malformed',
        SOURCE_ID,
        `Surah ${surahNumber} returned ${ayahs.length} ayahs, expected ${summary.versesCount}`,
      );
    }

    const verses: Verse[] = ayahs.map((ayah, index) => {
      // `aya` is a numeric string, not a number.
      const numberInSurah = Number(ayah.aya);

      if (!Number.isInteger(numberInSurah) || numberInSurah !== index + 1) {
        throw new QuranDataError(
          'malformed',
          SOURCE_ID,
          `Surah ${surahNumber} ayah ${index + 1} reports number "${ayah.aya}"`,
        );
      }

      const footnotes = stripByteOrderMark(ayah.footnotes ?? '').trim();

      return {
        id: `${surahNumber}:${numberInSurah}`,
        surahNumber,
        numberInSurah,
        arabic: stripByteOrderMark(ayah.arabic_text),
        translation: stripByteOrderMark(ayah.translation),
        // Absent rather than empty, so callers can test for presence. The `[n]`
        // markers stay inline in `translation` — removing them would be editing
        // the translation, which the licence forbids.
        ...(footnotes ? { footnotes } : {}),
      };
    });

    return { ...summary, verses };
  },
};
