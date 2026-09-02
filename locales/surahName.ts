import type { SurahSummary } from '../types/quran';
import { surahNameRu } from './ru/surahs';
import type { AppLanguage } from './types';

/**
 * The surah name to display, for a given interface language.
 *
 * `locales/ru/surahs.ts` remains the single reviewed Russian table and is not
 * touched here — this only chooses which existing source to read from.
 *
 * - **ru** — the reviewed Cyrillic table.
 * - **ky** — the same Cyrillic table, *deliberately*. No Kyrgyz name table has
 *   been reviewed, and inventing 114 transliterations is exactly the kind of
 *   unverified Quran-adjacent data this project refuses to create. Kyrgyz and
 *   Russian share the script, so the reviewed names are readable as-is. This is
 *   a documented placeholder, not a Kyrgyz translation.
 * - **en** — the Latin transliteration already verified in SURAH_INDEX.
 *
 * See docs/07_Data.md, "UI localization".
 */
export function surahName(
  language: AppLanguage,
  surah: Pick<SurahSummary, 'number' | 'transliteration'>,
): string {
  if (language === 'en') return surah.transliteration;
  return surahNameRu(surah);
}
