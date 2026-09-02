const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/**
 * Renders a number using Arabic-Indic digits (7 → ٧, 286 → ٢٨٦).
 *
 * Digits are written most-significant-first in Arabic just as in Latin, so a
 * positional substitution is correct — no reversal needed.
 */
export function toArabicNumber(value: number): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)]);
}
