/**
 * Spacing scale.
 *
 * The large steps matter more than the small ones here — breathing space
 * around the Quran text is a design requirement, not a preference.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  xxl: 44,
} as const;

/** Horizontal page margin for the reading surface. */
export const screenPadding = spacing.lg;

export type Spacing = typeof spacing;
