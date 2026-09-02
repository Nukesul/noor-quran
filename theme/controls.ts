/**
 * Interactive control tokens.
 *
 * These were the same numbers written out in four or five places — a pressed
 * opacity here, a 44pt box there — which is how two controls that should feel
 * identical quietly drift apart.
 */

/**
 * Minimum comfortable touch target.
 *
 * Deliberately larger than the glyph it wraps: the target is invisible, the
 * icon inside it is not.
 */
export const touchTarget = 44;

/** How far a control fades while held. Enough to acknowledge, not to flash. */
export const pressedOpacity = 0.45;

export const iconSize = {
  /**
   * Actions inside the reading surface — the verse toolbar. Smaller on purpose:
   * nothing on the page should compete with the Quran text.
   */
  action: 20,
  /** Navigation chevrons, back and forward alike, so they read as one family. */
  navigation: 24,
} as const;

export type IconSize = typeof iconSize;
