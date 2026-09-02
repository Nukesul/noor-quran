/**
 * Core Quran domain types.
 *
 * These describe the shape the Reader renders. A real data source (bundled
 * JSON or an API) must map onto these types rather than the Reader adapting
 * to it — that keeps the reading surface independent of where text comes from.
 */

export type RevelationPlace = 'meccan' | 'medinan';

export interface Verse {
  /** Canonical `surah:ayah` key, e.g. "1:1". Stable across data sources. */
  id: string;
  surahNumber: number;
  /** Ayah number within the surah, Hafs numbering. */
  numberInSurah: number;
  arabic: string;
  translation: string;
  /**
   * Translator's footnotes for this ayah, verbatim, when the edition has any.
   *
   * Undefined for editions that carry none and for ayahs without one — most
   * ayahs have none even in editions that use them.
   *
   * The text is stored exactly as published, which means the markers that refer
   * to it (`[1]`) remain inline in `translation`. Splitting them out would mean
   * editing the translation, which the licences forbid. How to render either is
   * an open design question — this field only makes sure the data survives.
   */
  footnotes?: string;
}

/**
 * Everything known about a surah *except* its text.
 *
 * Cheap enough to bundle for all 114, so surah navigation never needs the
 * network. See constants/surahIndex.ts.
 */
export interface SurahSummary {
  number: number;
  arabicName: string;
  /** Latin transliteration of the name, e.g. "Al-Fatihah". */
  transliteration: string;
  /** The name's meaning in the user's language, e.g. "Открывающая Коран". */
  translatedName: string;
  versesCount: number;
  revelationPlace: RevelationPlace;
  /**
   * Whether the Bismillah should render as a standalone header above the verses.
   *
   * False for exactly two surahs: Al-Fatihah (1), where the Bismillah *is* ayah 1
   * and is therefore part of `verses`, and At-Tawbah (9), which has none.
   * True for the remaining 112.
   */
  showsBismillahHeader: boolean;
}

/**
 * A surah with its text loaded — what the Reader renders.
 *
 * Carries no display name on purpose. Each data source used to supply its own,
 * which is how the Reader came to show "Аль-Фатиха" while the surah list showed
 * "Открывающая Коран" for the same surah. Display names now come from exactly
 * one place, `locales/ru/surahs.ts`, so no source can disagree with another.
 */
export interface Surah extends SurahSummary {
  verses: Verse[];
}

/**
 * What we are licensed to do with an edition's text when we redistribute it —
 * which is what bundling it into a shipped app amounts to.
 *
 * Recorded per edition because the licences genuinely differ: our Arabic text
 * and our Russian translation come from the same API under different terms.
 * See docs/07_Data.md for the primary sources behind each value.
 */
export type EditionDistribution =
  /** May be redistributed, including in a paid app, subject to attribution. */
  | 'redistributable'
  /** May only be redistributed in an app that is not monetised in any way. */
  | 'non-commercial-only'
  /** May not be redistributed at all until written permission is obtained. */
  | 'permission-required';

/**
 * A single text edition — one Arabic script or one translation.
 *
 * Modelled explicitly so that adding a second translation or a different Arabic
 * script later is a data change, not a code change.
 */
export interface Edition {
  /** Identifier used by the remote source, e.g. "quran-uthmani". */
  id: string;
  kind: 'arabic' | 'translation';
  /** ISO 639-1 language code. */
  language: string;
  name: string;
  /**
   * Text version, where the source publishes one.
   *
   * Undefined is normal: neither of our current editions exposes a version.
   * Never guess one — some licences require the version to be shown verbatim
   * when republishing, so a wrong value is worse than none.
   */
  version?: string;
  distribution: EditionDistribution;
  /**
   * Credit line required when displaying this edition. The Tanzil and
   * AlQuran.cloud terms both require the source to be named; translations must
   * additionally name the translator.
   */
  attribution: string;
  /**
   * URL that must be linked wherever the attribution appears, when the licence
   * requires a link rather than just a name.
   */
  sourceUrl?: string;
}

/** The pair of editions a Reader session is displaying. */
export interface EditionPair {
  arabic: Edition;
  translation: Edition;
}
