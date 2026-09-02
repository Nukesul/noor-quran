import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  bookArabicSize,
  colors,
  MAX_READING_WIDTH,
  screenPadding,
  spacing,
  translationSize,
} from '../../../theme';
import type { Verse } from '../../../types/quran';
import { toArabicNumber } from '../../../utils/toArabicNumber';
import { VerseFootnotes } from './VerseFootnotes';
import { VerseToolbar } from './VerseToolbar';

interface BookChunkProps {
  verses: Verse[];
  selectedVerseId: string | null;
  onSelect: (verseId: string) => void;
  arabicStep: number;
  translationStep: number;
}

/** U+06DD. Encloses the digits that follow it, drawing them inside the rosette. */
const END_OF_AYAH = '۝';

/**
 * The end-of-ayah marker, with the spacing that keeps it from wrecking the line.
 *
 * The space *before* the rosette is non-breaking. With an ordinary space the
 * marker was free to wrap on its own, so an ayah could open with a stray rosette
 * on a fresh line while the line above ended in a ragged hole. Bound to the word
 * it closes, it always breaks with that word instead.
 *
 * The space after is ordinary — that is the natural break point between one ayah
 * and the next.
 */
function ayahMarker(numberInSurah: number): string {
  return ` ${END_OF_AYAH}${toArabicNumber(numberInSurah)} `;
}

/**
 * One block of a Book-mode page.
 *
 * The Arabic is a **single** Text node with each ayah as a nested, tappable
 * span, so the text wraps and flows across ayah boundaries the way a printed
 * mushaf does — rather than each ayah being its own laid-out box with a gap
 * under it. Nested `<Text onPress>` is what keeps every ayah individually
 * selectable inside that continuous flow.
 *
 * Under it, set off by a short rule, the translation runs as the small print of
 * the page — the arrangement a printed translated mushaf uses. It is deliberately
 * not interleaved ayah-by-ayah: alternating one ayah of Arabic with one line of
 * translation would break the Arabic into boxes, which is the whole thing Book
 * mode exists to avoid.
 */
function BookChunkComponent({
  verses,
  selectedVerseId,
  onSelect,
  arabicStep,
  translationStep,
}: BookChunkProps) {
  // Book metrics, not Verse metrics: the same level, measured for a page whose
  // lines run on rather than standing alone.
  const arabic = bookArabicSize(arabicStep);

  // The reader's chosen size, exactly — Book mode does not quietly borrow a
  // step. Doing so used to collapse the bottom two steps onto the same size, so
  // the − button did nothing here while it visibly worked in Verse mode. The
  // translation is made subordinate by colour and leading instead, which costs
  // the control nothing.
  const translation = translationSize(translationStep);

  // Markers ride with the Arabic instead of sitting at a fixed size: pinned at
  // 20 they swamped the smallest step and vanished at the largest.
  const markerSize = { fontSize: Math.round(arabic.fontSize * 0.7) };

  // Ayah numbers in the translation track it the same way, so the gloss keeps
  // its proportions at every step instead of drifting apart.
  const numberSize = { fontSize: Math.round(translation.fontSize * 0.8) };

  return (
    <View style={styles.chunk}>
      <Text style={[styles.arabicFlow, arabic]}>
        {verses.map((verse) => {
          const isSelected = verse.id === selectedVerseId;

          return (
            <Text
              key={verse.id}
              onPress={() => onSelect(verse.id)}
              suppressHighlighting
              style={isSelected ? styles.arabicSelected : undefined}
              accessibilityRole="button"
            >
              {verse.arabic}
              <Text style={[styles.marker, markerSize]}>{ayahMarker(verse.numberInSurah)}</Text>
            </Text>
          );
        })}
      </Text>

      {/*
        A short rule, not a full-width one. Printed books mark off the small
        print under the body text this way; a rule running edge to edge reads as
        the top of a card instead.
      */}
      <View style={styles.rule} />

      <View style={styles.gloss}>
        {verses.map((verse) => {
          const isSelected = verse.id === selectedVerseId;

          return (
            <View
              key={verse.id}
              style={[styles.glossEntry, isSelected && styles.glossEntrySelected]}
            >
              <Text style={[styles.glossText, translation]}>
                <Text style={[styles.glossNumber, numberSize]}>
                  {`${verse.numberInSurah}. `}
                </Text>
                {verse.translation}
              </Text>

              {verse.footnotes && (
                <VerseFootnotes footnotes={verse.footnotes} textSize={translation} />
              )}

              {/*
                Anchored to the selected ayah's own gloss rather than to the
                bottom of the block: tapping ayah 3 of 8 and having the toolbar
                appear seven translations further down reads as unrelated.
              */}
              {isSelected && <VerseToolbar />}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export const BookChunk = memo(BookChunkComponent);

const styles = StyleSheet.create({
  chunk: {
    // Wider margins than the rest of the app. A reading page needs the text to
    // sit off the bezel; the list screens do not.
    paddingHorizontal: screenPadding + spacing.xs,
    // Deliberately tight at the top. Blocks are an implementation detail of
    // virtualization, not a design element — the page should read as continuous
    // across them, so only the tail carries the break.
    paddingTop: 0,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: MAX_READING_WIDTH,
    alignSelf: 'center',
  },
  arabicFlow: {
    color: colors.textPrimary,
    // Right-aligned, not justified. React Native justifies by stretching the
    // spaces between words, and Arabic has no kashida elongation to absorb it —
    // so a justified line pulled its words apart into disconnected islands. A
    // natural ragged edge reads far closer to a printed page than that does.
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  arabicSelected: {
    // The same warm tone a selected verse takes in Verse mode, applied to the
    // span rather than a block.
    backgroundColor: colors.verseSelected,
  },
  marker: {
    color: colors.accent,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    // A third of the measure, hard against the margin — the proportion a
    // printed footnote rule takes.
    width: '32%',
    marginTop: spacing.lg,
  },
  gloss: {
    paddingTop: spacing.md,
  },
  glossEntry: {
    // Just enough to keep two glosses from running together. Anything larger
    // and the block stops reading as small print under the page and starts
    // reading as a list of rows.
    marginBottom: spacing.sm,
  },
  glossEntrySelected: {
    // Ties the gloss to the highlighted Arabic span above it, so a selection
    // reads as one ayah across both halves of the page.
    backgroundColor: colors.verseSelected,
  },
  glossText: {
    color: colors.textSecondary,
  },
  glossNumber: {
    color: colors.accent,
    fontWeight: '600',
    // No `lineHeight` here on purpose: a nested span carrying its own leading
    // makes Android re-space the whole line it lands on, so the gloss would
    // ripple as ayah numbers moved between lines.
  },
});
