import { SURAH_INDEX } from '../../../constants/surahIndex';
import type { Surah, SurahSummary } from '../../../types/quran';
import { AL_FATIHAH } from '../data/alFatihah';
import { ARABIC_UTHMANI, RUSSIAN_KULIEV } from '../editions';
import type { QuranDataSource, SurahRequest } from '../types';

/** Surahs whose text ships inside the app. */
const BUNDLED_SURAHS: Readonly<Record<number, Surah>> = {
  1: AL_FATIHAH,
};

/**
 * The editions the bundled text actually *is*.
 *
 * `data/alFatihah.ts` is generated from `quran-uthmani` and `ru.kuliev`, and was
 * verified byte-identical to both. Bundled text is therefore a fixed pair, not
 * whatever the caller happens to ask for.
 */
const BUNDLED_ARABIC_ID = ARABIC_UTHMANI.id;
const BUNDLED_TRANSLATION_ID = RUSSIAN_KULIEV.id;

function holdsRequestedEditions(request: SurahRequest): boolean {
  return (
    request.editions.arabic.id === BUNDLED_ARABIC_ID &&
    request.editions.translation.id === BUNDLED_TRANSLATION_ID
  );
}

/**
 * Serves what ships with the app: metadata for all 114 surahs, and text for the
 * few that are bundled.
 *
 * Always first in the source chain, so bundled content costs no network and no
 * loading state.
 *
 * Declines any edition pair it does not hold. This used to ignore
 * `request.editions` entirely, which was harmless while one translation
 * existed and actively wrong the moment a second one does: a reader who picked
 * a different translation would have been handed Al-Fatihah in Kuliev anyway,
 * silently, because the bundle answered first. Returning null lets the chain
 * fall through to a source that genuinely has the requested edition.
 */
export const bundledSource: QuranDataSource = {
  id: 'bundled',

  async getSurahIndex(): Promise<readonly SurahSummary[]> {
    return SURAH_INDEX;
  },

  async getSurah(request: SurahRequest): Promise<Surah | null> {
    if (!holdsRequestedEditions(request)) return null;
    return BUNDLED_SURAHS[request.surahNumber] ?? null;
  },

  getSurahSync(request: SurahRequest): Surah | null {
    if (!holdsRequestedEditions(request)) return null;
    return BUNDLED_SURAHS[request.surahNumber] ?? null;
  },
};
