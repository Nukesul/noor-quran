/**
 * Noor Quran — color tokens (light).
 *
 * Green is an accent, never a surface. The Quran text is the only element
 * allowed to carry full contrast; everything else recedes.
 */
export const colors = {
  /** Page background — warm, soft, low glare. */
  background: '#F8F7F3',

  /** Quran text and surah name. The only full-contrast ink in the app. */
  textPrimary: '#1C1C1C',
  /** Translation, labels, metadata. */
  textSecondary: '#6F6F6A',

  /** Hairline separators. Used sparingly. */
  divider: '#E8E6DF',

  /** Accent green — small marks only: verse numbers, icons, thin rules. */
  accent: '#5B8062',
  /** Soft green — the verse-number badge fill. Never a full-width surface. */
  accentSoft: '#EAF1EB',

  /**
   * Selected verse background.
   * Deliberately a warmer neutral rather than the green accent: a large green
   * block would pull attention away from the Quran text. This reads as the
   * page slightly deepening under the verse, not as a UI selection chip.
   */
  verseSelected: '#F1EEE5',
} as const;

export type Colors = typeof colors;
