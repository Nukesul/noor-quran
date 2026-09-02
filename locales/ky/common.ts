import type { LanguagePack } from '../types';

/**
 * Kyrgyz.
 *
 * Surah and ayah numbers take the Kyrgyz ordinal form — "2-сүрө", "255-аят" —
 * rather than the Russian "Сура 2" word order, because that is how they are
 * read aloud.
 */
export const ky: LanguagePack = {
  strings: {
    'common.back': 'Артка',

    'home.continueReading': 'Окууну улантуу',
    'home.continueReadingA11y': 'Окууну улантуу: {name}, {surah}-сүрө, {ayah}-аят',
    'home.positionMeta': '{surah}-сүрө · {ayah}-аят',
    'home.allSurahs': 'Бардык сүрөлөр',
    'home.allSurahsA11y': 'Бардык сүрөлөрдүн тизмесин ачуу',
    'home.settings': 'Жөндөөлөр',
    'home.settingsA11y': 'Жөндөөлөрдү ачуу',

    'settings.title': 'Жөндөөлөр',
    'settings.language': 'Тил',
    'settings.about': 'Колдонмо жөнүндө',
    'settings.aboutDescription': 'Курандын тынч окулушу. Жарнаксыз жана ашыкчасыз.',
    'settings.quranTranslation': 'Курандын котормосу',
    'settings.translationRussian': 'Орусча',
    'settings.translationEnglish': 'Англисче',
    'settings.translationKyrgyz': 'Кыргызча',

    'settings.sources': 'Булактар',
    'settings.sourceArabic': 'Араб тексти',
    'settings.sourceTranslation': 'Котормо',
    'settings.version': 'Версия',

    'surahList.title': 'Сүрөлөр',
    'surahList.itemA11y': '{surah}-сүрө, {name}, {verses}, {revelation}',

    'reader.backToList': 'Сүрөлөр тизмесине',
    'reader.loadFailed': 'Сүрөнү жүктөө мүмкүн болгон жок.\nИнтернет байланышын текшериңиз.',
    'reader.verseA11y': '{ayah}-аят. {translation}',
    'reader.bismillahA11y': 'Бисмиллахи-р-Рахмани-р-Рахим',
    'reader.footnotes': 'Эскертүүлөр',

    'reader.readingControls': 'Окуу жөндөөлөрү',
    'reader.readingStyle': 'Окуу режими',
    'reader.modeVerse': 'Аят боюнча',
    'reader.modeBook': 'Китеп',
    'reader.arabicSize': 'Араб тексти',
    'reader.translationSize': 'Котормо',
    'reader.decrease': 'Кичирейтүү',
    'reader.increase': 'Чоңойтуу',
    'reader.flip': 'Бурап коюу',
    'reader.close': 'Жабуу',
    'reader.toolbar.bookmark': 'Кыстарма',
    'reader.toolbar.audio': 'Аудио',
    'reader.toolbar.translation': 'Котормо',
    'reader.toolbar.more': 'Дагы',

    'surah.numberLabel': '{number}-сүрө',

    'revelation.meccan': 'Меккелик',
    'revelation.medinan': 'Мединалык',

    'language.a11y': 'Интерфейс тили',
  },

  /** Kyrgyz nouns take no plural ending after a numeral: 1 аят, 7 аят. */
  versesLabel: (count) => `${count} аят`,
};
