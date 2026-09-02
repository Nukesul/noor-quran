/**
 * Reading presentation: how the Quran is laid out and at what size.
 *
 * Every mode is the *same* virtualized reading surface with different
 * typography — not a different list. That is what lets mode changes keep verse
 * selection, footnotes, ayah anchoring and virtualization intact, and what lets
 * the transition read as the page restyling itself rather than reloading.
 */

export type ReadingMode = 'verse' | 'book';

export const READING_MODES: readonly ReadingMode[] = ['verse', 'book'];

export const DEFAULT_READING_MODE: ReadingMode = 'verse';

/**
 * How many ayahs flow together in one Book-mode block.
 *
 * The whole surah cannot be a single Text node — Al-Baqarah would be one
 * 286-ayah item and virtualization would be gone. Chunking keeps FlatList
 * working while the Arabic still runs on continuously *within* a block, and the
 * blocks butt up against each other closely enough that the page reads as one
 * surface rather than as cards.
 *
 * Eight is a compromise: small enough that a chunk is cheap to lay out, large
 * enough that chunk boundaries are not the dominant rhythm of the page.
 */
export const BOOK_CHUNK_SIZE = 8;

export interface TextSize {
  fontSize: number;
  lineHeight: number;
}

/**
 * Five steps each. Index 1 is exactly today's typography, so a reader who never
 * touches these sees the app they already had.
 *
 * Line heights grow faster than glyph size: Arabic diacritics stack above and
 * below the baseline, and leading that merely tracks font size gets cramped
 * precisely when someone has enlarged the text because it was hard to read.
 */
/** small · normal · large · extraLarge · huge */
export const ARABIC_SIZES: readonly TextSize[] = [
  { fontSize: 24, lineHeight: 44 },
  { fontSize: 29, lineHeight: 52 },
  { fontSize: 34, lineHeight: 61 },
  { fontSize: 40, lineHeight: 72 },
  { fontSize: 46, lineHeight: 84 },
];

/**
 * The same five steps, re-metered for Book mode.
 *
 * A size that reads well as an isolated verse block reads as a wall when the
 * text runs on continuously: at 29 the flowing page fit only six or seven words
 * to a line, so every line broke mid-thought and the page felt zoomed-in rather
 * than composed. Book mode wants a longer measure — roughly ten to twelve words
 * — which is what makes a page scan as prose instead of as fragments.
 *
 * Leading is a flat ~2.0× here rather than Verse mode's ~1.8×. Consecutive lines
 * of Arabic need more air between them than a single verse followed by its
 * translation does, or the diacritics of one line crowd the tails of the line
 * above.
 *
 * This is still one five-level system with one stored step — `small` in Book
 * mode is the same *level* as `small` in Verse mode, just measured for a
 * different page.
 */
export const BOOK_ARABIC_SIZES: readonly TextSize[] = [
  { fontSize: 18, lineHeight: 36 },
  { fontSize: 21, lineHeight: 42 },
  { fontSize: 25, lineHeight: 49 },
  { fontSize: 29, lineHeight: 57 },
  { fontSize: 34, lineHeight: 66 },
];

/**
 * The widest the reading column is allowed to get.
 *
 * Portrait phones never reach it, so it changes nothing there. It exists for
 * landscape and for tablets, which would otherwise run Arabic the full width of
 * the screen — unreadable for the same reason a newspaper uses columns.
 *
 * 680 rather than something tighter: at the default Arabic size this lands
 * around sixty-five characters a line, inside the comfortable measure, while
 * still filling enough of a landscape screen that the page does not read as a
 * narrow strip stranded in empty space.
 */
export const MAX_READING_WIDTH = 680;

export const TRANSLATION_SIZES: readonly TextSize[] = [
  { fontSize: 14, lineHeight: 24 },
  { fontSize: 16, lineHeight: 27 },
  { fontSize: 18, lineHeight: 31 },
  { fontSize: 21, lineHeight: 36 },
  { fontSize: 24, lineHeight: 41 },
];

/** Index 1 in both scales — the typography the Reader shipped with. */
export const DEFAULT_SIZE_STEP = 1;

export const MIN_SIZE_STEP = 0;
export const MAX_SIZE_STEP = ARABIC_SIZES.length - 1;

export function clampSizeStep(step: number): number {
  if (!Number.isInteger(step)) return DEFAULT_SIZE_STEP;
  return Math.min(MAX_SIZE_STEP, Math.max(MIN_SIZE_STEP, step));
}

export function arabicSize(step: number): TextSize {
  return ARABIC_SIZES[clampSizeStep(step)];
}

/** Arabic metrics for the continuous Book-mode page. */
export function bookArabicSize(step: number): TextSize {
  return BOOK_ARABIC_SIZES[clampSizeStep(step)];
}

export function translationSize(step: number): TextSize {
  return TRANSLATION_SIZES[clampSizeStep(step)];
}
