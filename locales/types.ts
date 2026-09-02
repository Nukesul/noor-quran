import type { RevelationPlace } from '../types/quran';

/**
 * UI localization.
 *
 * This layer localizes the *interface* only. Quran text and its translations
 * are a separate concern owned by the Quran data layer — changing the UI
 * language never changes which Quran edition is displayed. See docs/07_Data.md.
 */

export type AppLanguage = 'ru' | 'ky' | 'en';

export const APP_LANGUAGES: readonly AppLanguage[] = ['ru', 'ky', 'en'];

/** Russian, because the interface was written in Russian first. */
export const DEFAULT_LANGUAGE: AppLanguage = 'ru';

/**
 * Every user-visible string in the app.
 *
 * Declared as an exact interface so a language pack missing a key, or inventing
 * one, fails to compile. That is what guarantees all three languages stay in
 * step without a runtime check.
 *
 * `{placeholders}` are filled by `t(key, params)`.
 */
export interface AppStrings {
  'common.back': string;

  'home.continueReading': string;
  /** "{name}, сура {surah}, аят {ayah}" */
  'home.continueReadingA11y': string;
  /** "Сура {surah} · аят {ayah}" */
  'home.positionMeta': string;
  'home.allSurahs': string;
  'home.allSurahsA11y': string;
  'home.settings': string;
  'home.settingsA11y': string;

  'settings.title': string;
  'settings.language': string;
  'settings.about': string;
  'settings.aboutDescription': string;
  'settings.quranTranslation': string;
  /** Language names for the Quran-translation picker, not the interface. */
  'settings.translationRussian': string;
  'settings.translationEnglish': string;
  'settings.translationKyrgyz': string;

  'settings.sources': string;
  'settings.sourceArabic': string;
  'settings.sourceTranslation': string;
  'settings.version': string;

  'surahList.title': string;
  /** "Сура {surah}, {name}, {verses}, {revelation}" */
  'surahList.itemA11y': string;

  'reader.backToList': string;
  'reader.loadFailed': string;
  /** "Аят {ayah}. {translation}" */
  'reader.verseA11y': string;
  'reader.bismillahA11y': string;
  /** Toggle for the translator's footnotes under an ayah. */
  'reader.footnotes': string;

  'reader.readingControls': string;
  'reader.readingStyle': string;
  'reader.modeVerse': string;
  'reader.modeBook': string;
  'reader.arabicSize': string;
  'reader.translationSize': string;
  'reader.decrease': string;
  'reader.increase': string;
  /** Turns the reading page 180°, for reading the phone the other way up. */
  'reader.flip': string;
  'reader.close': string;
  'reader.toolbar.bookmark': string;
  'reader.toolbar.audio': string;
  'reader.toolbar.translation': string;
  'reader.toolbar.more': string;

  /** "Сура {number}" */
  'surah.numberLabel': string;

  'revelation.meccan': string;
  'revelation.medinan': string;

  'language.a11y': string;
}

export type TranslationKey = keyof AppStrings;

export interface LanguagePack {
  strings: AppStrings;
  /**
   * Ayah count with the right plural form.
   *
   * A function rather than a string because the rule is genuinely
   * language-specific: Russian has three forms, English two, Kyrgyz none.
   */
  versesLabel: (count: number) => string;
}

/** Maps a revelation place to its key, so lookups stay literal-typed. */
export const REVELATION_KEY: Record<RevelationPlace, TranslationKey> = {
  meccan: 'revelation.meccan',
  medinan: 'revelation.medinan',
};

/**
 * Language names, always written in their own language.
 *
 * Endonyms are not translated, so these are shared rather than repeated in each
 * pack — "English" stays "English" in the Russian interface.
 */
export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  ru: 'Русский',
  ky: 'Кыргызча',
  en: 'English',
};
