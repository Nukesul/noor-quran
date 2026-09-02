import type { SurahSummary } from '../../types/quran';

/**
 * Cyrillic transliterations of the 114 surah names.
 *
 * HAND-AUTHORED — the only content in this project not derived from a verified
 * source, because no source provides it. quran.com returns the Russian *meaning*
 * ("Открывающая Коран"); AlQuran.cloud, QuranEnc and fawazahmed0 all return
 * Latin transliterations only. Verified absent, not merely unsearched.
 *
 * These are transliterations of the Arabic names, not translations of them, and
 * follow the convention used in Russian Islamic literature:
 *
 * - The definite article is written "Аль-" and hyphenated.
 * - Sun letters assimilate: Ан-Нас, Ат-Тауба, Аш-Шамс, Аз-Зумар — not Аль-Нас.
 * - Moon letters do not: Аль-Фатиха, Аль-Кахф, Аль-Мульк.
 * - Arabic ث is rendered "с" (Аль-Каусар), ذ as "з" (Аз-Зарият).
 * - Names without the article keep their bare form: Юнус, Марьям, Лукман.
 *
 * The verified Latin transliteration from SURAH_INDEX is kept beside each entry
 * so the two can be checked against each other at a glance.
 *
 * NEEDS NATIVE REVIEW before release. Transliteration conventions vary between
 * Russian editions and this table reflects one consistent choice, not a
 * canonical standard. It affects display labels only — never Quran text.
 */
export const SURAH_NAMES_RU: Readonly<Record<number, string>> = {
  1: 'Аль-Фатиха', // Al-Fatihah
  2: 'Аль-Бакара', // Al-Baqarah
  3: 'Али Имран', // Ali 'Imran
  4: 'Ан-Ниса', // An-Nisa
  5: 'Аль-Маида', // Al-Ma'idah
  6: 'Аль-Анам', // Al-An'am
  7: 'Аль-Араф', // Al-A'raf
  8: 'Аль-Анфаль', // Al-Anfal
  9: 'Ат-Тауба', // At-Tawbah
  10: 'Юнус', // Yunus
  11: 'Худ', // Hud
  12: 'Юсуф', // Yusuf
  13: 'Ар-Раад', // Ar-Ra'd
  14: 'Ибрахим', // Ibrahim
  15: 'Аль-Хиджр', // Al-Hijr
  16: 'Ан-Нахль', // An-Nahl
  17: 'Аль-Исра', // Al-Isra
  18: 'Аль-Кахф', // Al-Kahf
  19: 'Марьям', // Maryam
  20: 'Та Ха', // Taha
  21: 'Аль-Анбия', // Al-Anbya
  22: 'Аль-Хадж', // Al-Hajj
  23: 'Аль-Муминун', // Al-Mu'minun
  24: 'Ан-Нур', // An-Nur
  25: 'Аль-Фуркан', // Al-Furqan
  26: 'Аш-Шуара', // Ash-Shu'ara
  27: 'Ан-Намль', // An-Naml
  28: 'Аль-Касас', // Al-Qasas
  29: 'Аль-Анкабут', // Al-'Ankabut
  30: 'Ар-Рум', // Ar-Rum
  31: 'Лукман', // Luqman
  32: 'Ас-Саджда', // As-Sajdah
  33: 'Аль-Ахзаб', // Al-Ahzab
  34: 'Саба', // Saba
  35: 'Фатир', // Fatir
  36: 'Йа Син', // Ya-Sin
  37: 'Ас-Саффат', // As-Saffat
  38: 'Сад', // Sad
  39: 'Аз-Зумар', // Az-Zumar
  40: 'Гафир', // Ghafir
  41: 'Фуссилат', // Fussilat
  42: 'Аш-Шура', // Ash-Shuraa
  43: 'Аз-Зухруф', // Az-Zukhruf
  44: 'Ад-Духан', // Ad-Dukhan
  45: 'Аль-Джасия', // Al-Jathiyah
  46: 'Аль-Ахкаф', // Al-Ahqaf
  47: 'Мухаммад', // Muhammad
  48: 'Аль-Фатх', // Al-Fath
  49: 'Аль-Худжурат', // Al-Hujurat
  50: 'Каф', // Qaf
  51: 'Аз-Зарият', // Adh-Dhariyat
  52: 'Ат-Тур', // At-Tur
  53: 'Ан-Наджм', // An-Najm
  54: 'Аль-Камар', // Al-Qamar
  55: 'Ар-Рахман', // Ar-Rahman
  56: 'Аль-Вакиа', // Al-Waqi'ah
  57: 'Аль-Хадид', // Al-Hadid
  58: 'Аль-Муджадила', // Al-Mujadila
  59: 'Аль-Хашр', // Al-Hashr
  60: 'Аль-Мумтахана', // Al-Mumtahanah
  61: 'Ас-Сафф', // As-Saf
  62: 'Аль-Джумуа', // Al-Jumu'ah
  63: 'Аль-Мунафикун', // Al-Munafiqun
  64: 'Ат-Тагабун', // At-Taghabun
  65: 'Ат-Талак', // At-Talaq
  66: 'Ат-Тахрим', // At-Tahrim
  67: 'Аль-Мульк', // Al-Mulk
  68: 'Аль-Калам', // Al-Qalam
  69: 'Аль-Хакка', // Al-Haqqah
  70: 'Аль-Мааридж', // Al-Ma'arij
  71: 'Нух', // Nuh
  72: 'Аль-Джинн', // Al-Jinn
  73: 'Аль-Муззаммиль', // Al-Muzzammil
  74: 'Аль-Муддассир', // Al-Muddaththir
  75: 'Аль-Кияма', // Al-Qiyamah
  76: 'Аль-Инсан', // Al-Insan
  77: 'Аль-Мурсалят', // Al-Mursalat
  78: 'Ан-Наба', // An-Naba
  79: 'Ан-Назиат', // An-Nazi'at
  80: 'Абаса', // 'Abasa
  81: 'Ат-Таквир', // At-Takwir
  82: 'Аль-Инфитар', // Al-Infitar
  83: 'Аль-Мутаффифин', // Al-Mutaffifin
  84: 'Аль-Иншикак', // Al-Inshiqaq
  85: 'Аль-Бурудж', // Al-Buruj
  86: 'Ат-Тарик', // At-Tariq
  87: 'Аль-Аля', // Al-A'la
  88: 'Аль-Гашия', // Al-Ghashiyah
  89: 'Аль-Фаджр', // Al-Fajr
  90: 'Аль-Балад', // Al-Balad
  91: 'Аш-Шамс', // Ash-Shams
  92: 'Аль-Лайль', // Al-Layl
  93: 'Ад-Духа', // Ad-Duhaa
  94: 'Аш-Шарх', // Ash-Sharh
  95: 'Ат-Тин', // At-Tin
  96: 'Аль-Алак', // Al-'Alaq
  97: 'Аль-Кадр', // Al-Qadr
  98: 'Аль-Баййина', // Al-Bayyinah
  99: 'Аз-Зальзаля', // Az-Zalzalah
  100: 'Аль-Адият', // Al-'Adiyat
  101: 'Аль-Кариа', // Al-Qari'ah
  102: 'Ат-Такасур', // At-Takathur
  103: 'Аль-Аср', // Al-'Asr
  104: 'Аль-Хумаза', // Al-Humazah
  105: 'Аль-Филь', // Al-Fil
  106: 'Курайш', // Quraysh
  107: 'Аль-Маун', // Al-Ma'un
  108: 'Аль-Каусар', // Al-Kawthar
  109: 'Аль-Кафирун', // Al-Kafirun
  110: 'Ан-Наср', // An-Nasr
  111: 'Аль-Масад', // Al-Masad
  112: 'Аль-Ихлас', // Al-Ikhlas
  113: 'Аль-Фаляк', // Al-Falaq
  114: 'Ан-Нас', // An-Nas
};

/**
 * The surah name to display, for every screen.
 *
 * The single source of display names — the Reader header and the surah list
 * both call this, so they cannot disagree. Falls back to the verified Latin
 * transliteration if a number is ever missing from the table, which is
 * preferable to rendering an empty header.
 */
export function surahNameRu(surah: Pick<SurahSummary, 'number' | 'transliteration'>): string {
  return SURAH_NAMES_RU[surah.number] ?? surah.transliteration;
}
