import type { LanguagePack } from '../types';

/**
 * Russian — the baseline.
 *
 * Every string here is the exact wording the interface already shipped with.
 * Nothing was reworded while extracting them.
 */
export const ru: LanguagePack = {
  strings: {
    'common.back': 'Назад',

    'home.continueReading': 'Продолжить чтение',
    'home.continueReadingA11y': 'Продолжить чтение: {name}, сура {surah}, аят {ayah}',
    'home.positionMeta': 'Сура {surah} · аят {ayah}',
    'home.allSurahs': 'Все суры',
    'home.allSurahsA11y': 'Открыть список всех сур',
    'home.settings': 'Настройки',
    'home.settingsA11y': 'Открыть настройки',

    'settings.title': 'Настройки',
    'settings.language': 'Язык',
    'settings.about': 'О приложении',
    'settings.aboutDescription': 'Спокойное чтение Корана. Без рекламы и лишнего.',
    'settings.quranTranslation': 'Перевод Корана',
    'settings.translationRussian': 'Русский',
    'settings.translationEnglish': 'Английский',
    'settings.translationKyrgyz': 'Кыргызский',

    'settings.sources': 'Источники',
    'settings.sourceArabic': 'Арабский текст',
    'settings.sourceTranslation': 'Перевод',
    'settings.version': 'Версия',

    'surahList.title': 'Суры',
    'surahList.itemA11y': 'Сура {surah}, {name}, {verses}, {revelation}',

    'reader.backToList': 'К списку сур',
    'reader.loadFailed': 'Не удалось загрузить суру.\nПроверьте подключение к интернету.',
    'reader.verseA11y': 'Аят {ayah}. {translation}',
    'reader.bismillahA11y': 'Бисмилляхи-р-Рахмани-р-Рахим',
    'reader.footnotes': 'Примечания',

    'reader.readingControls': 'Настройки чтения',
    'reader.readingStyle': 'Режим чтения',
    'reader.modeVerse': 'По аятам',
    'reader.modeBook': 'Книга',
    'reader.arabicSize': 'Арабский текст',
    'reader.translationSize': 'Перевод',
    'reader.decrease': 'Уменьшить',
    'reader.increase': 'Увеличить',
    'reader.flip': 'Перевернуть',
    'reader.close': 'Закрыть',
    'reader.toolbar.bookmark': 'Закладка',
    'reader.toolbar.audio': 'Аудио',
    'reader.toolbar.translation': 'Перевод',
    'reader.toolbar.more': 'Ещё',

    'surah.numberLabel': 'Сура {number}',

    'revelation.meccan': 'Мекканская',
    'revelation.medinan': 'Мединская',

    'language.a11y': 'Язык интерфейса',
  },

  /** Three forms: 1 аят / 2 аята / 5 аятов, with 11–14 taking the last. */
  versesLabel: (count) => {
    const mod100 = count % 100;
    const mod10 = count % 10;

    if (mod100 >= 11 && mod100 <= 14) return `${count} аятов`;
    if (mod10 === 1) return `${count} аят`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} аята`;
    return `${count} аятов`;
  },
};
