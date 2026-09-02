import { SURAH_INDEX } from '../../../constants/surahIndex';
import type { Surah } from '../../../types/quran';

/**
 * Surah 1 — Al-Fatihah, bundled.
 *
 * Kept in the app so the Reader — which is the home screen — always has
 * something to render on first launch, with no network and no loading state.
 *
 * ARABIC AND TRANSLATION ARE BOTH GENERATED — do not edit by hand.
 * Arabic:      https://api.alquran.cloud/v1/surah/1/quran-uthmani  (Tanzil)
 * Translation: https://api.alquran.cloud/v1/surah/1/ru.kuliev      (Elmir Kuliev)
 * Generated: 2026-08-13
 *
 * These are the same two editions `DEFAULT_EDITIONS` requests, so bundled and
 * remote surah 1 are byte-identical in both languages.
 *
 * Editing these strings by hand is unsafe: editors silently reorder Arabic
 * combining marks (shadda/fatha), producing text that renders identically but
 * no longer matches the source byte-for-byte. It also reintroduces the kind of
 * drift this file exists to eliminate — the previous hand-written Russian read
 * "путём" where Kuliev has "путем". Regenerate instead.
 *
 * The only transformation applied is stripping a leading U+FEFF byte-order mark
 * (present on Arabic 1:1, absent from the Russian). Tanzil's terms permit
 * verbatim copies only.
 *
 * LICENSING — the two differ, see docs/07_Data.md:
 * the Arabic may be used commercially with attribution; the Kuliev translation
 * is distributed by Tanzil for NON-COMMERCIAL use only.
 *
 * Metadata is spread from the verified SURAH_INDEX rather than repeated here,
 * so the two can never disagree.
 *
 * The Bismillah is ayah 1 of this surah (`showsBismillahHeader` is false in the
 * index), so it lives in `verses`. Numbering it as a decorative header would
 * shift every following ayah by one.
 */
export const AL_FATIHAH: Surah = {
  ...SURAH_INDEX[0],
  verses: [
    {
      id: "1:1",
      surahNumber: 1,
      numberInSurah: 1,
      arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translation: "Во имя Аллаха, Милостивого, Милосердного!",
    },
    {
      id: "1:2",
      surahNumber: 1,
      numberInSurah: 2,
      arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
      translation: "Хвала Аллаху, Господу миров,",
    },
    {
      id: "1:3",
      surahNumber: 1,
      numberInSurah: 3,
      arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translation: "Милостивому, Милосердному,",
    },
    {
      id: "1:4",
      surahNumber: 1,
      numberInSurah: 4,
      arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
      translation: "Властелину Дня воздаяния!",
    },
    {
      id: "1:5",
      surahNumber: 1,
      numberInSurah: 5,
      arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translation: "Тебе одному мы поклоняемся и Тебя одного молим о помощи.",
    },
    {
      id: "1:6",
      surahNumber: 1,
      numberInSurah: 6,
      arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      translation: "Веди нас прямым путем,",
    },
    {
      id: "1:7",
      surahNumber: 1,
      numberInSurah: 7,
      arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      translation: "путем тех, кого Ты облагодетельствовал, не тех, на кого пал гнев, и не заблудших.",
    },
  ],
};
