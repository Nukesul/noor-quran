import type { LanguagePack } from '../types';

export const en: LanguagePack = {
  strings: {
    'common.back': 'Back',

    'home.continueReading': 'Continue reading',
    'home.continueReadingA11y': 'Continue reading: {name}, surah {surah}, ayah {ayah}',
    'home.positionMeta': 'Surah {surah} · ayah {ayah}',
    'home.allSurahs': 'All surahs',
    'home.allSurahsA11y': 'Open the list of all surahs',
    'home.settings': 'Settings',
    'home.settingsA11y': 'Open settings',

    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.about': 'About',
    'settings.aboutDescription': 'A calm way to read the Quran. No ads, nothing extra.',
    'settings.quranTranslation': 'Quran translation',
    'settings.translationRussian': 'Russian',
    'settings.translationEnglish': 'English',
    'settings.translationKyrgyz': 'Kyrgyz',

    'settings.sources': 'Sources',
    'settings.sourceArabic': 'Arabic text',
    'settings.sourceTranslation': 'Translation',
    'settings.version': 'Version',

    'surahList.title': 'Surahs',
    'surahList.itemA11y': 'Surah {surah}, {name}, {verses}, {revelation}',

    'reader.backToList': 'Back to surah list',
    'reader.loadFailed': 'Could not load the surah.\nCheck your internet connection.',
    'reader.verseA11y': 'Ayah {ayah}. {translation}',
    'reader.bismillahA11y': 'Bismillahi-r-Rahmani-r-Rahim',
    'reader.footnotes': 'Notes',

    'reader.readingControls': 'Reading settings',
    'reader.readingStyle': 'Reading style',
    'reader.modeVerse': 'Verse by verse',
    'reader.modeBook': 'Book',
    'reader.arabicSize': 'Arabic text',
    'reader.translationSize': 'Translation',
    'reader.decrease': 'Decrease',
    'reader.increase': 'Increase',
    'reader.flip': 'Flip page',
    'reader.close': 'Close',
    'reader.toolbar.bookmark': 'Bookmark',
    'reader.toolbar.audio': 'Audio',
    'reader.toolbar.translation': 'Translation',
    'reader.toolbar.more': 'More',

    'surah.numberLabel': 'Surah {number}',

    'revelation.meccan': 'Meccan',
    'revelation.medinan': 'Medinan',

    'language.a11y': 'Interface language',
  },

  versesLabel: (count) => `${count} ${count === 1 ? 'ayah' : 'ayahs'}`,
};
