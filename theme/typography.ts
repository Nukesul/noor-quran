import type { TextStyle } from 'react-native';

/**
 * Type scale.
 *
 * Arabic runs at a generous size and line height — Arabic diacritics need
 * vertical room, and cramped leading is the fastest way to make a Quran app
 * feel like a generic list view.
 *
 * TODO (later phase): load a proper Uthmani face (KFGQPC / Amiri) via
 * expo-font and set `fontFamily` on `arabic` and `bismillah`.
 */
export const typography = {
  surahLabel: { fontSize: 13, lineHeight: 18 },
  surahName: { fontSize: 28, lineHeight: 36, fontWeight: '600' },
  surahMeta: { fontSize: 13, lineHeight: 18 },

  bismillah: { fontSize: 34, lineHeight: 58 },
  arabic: { fontSize: 29, lineHeight: 52 },
  translation: { fontSize: 16, lineHeight: 27 },

  // Slightly heavier than its size suggests: Arabic-Indic digits are visually
  // lighter than Latin ones, so 13/600 is needed to read as clearly as 12/400
  // would in Latin — while still staying quieter than the translation.
  verseNumber: { fontSize: 13, lineHeight: 17, fontWeight: '600' },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
