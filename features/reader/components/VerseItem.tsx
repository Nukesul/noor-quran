import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../locales';
import {
  arabicSize,
  colors,
  MAX_READING_WIDTH,
  screenPadding,
  spacing,
  translationSize,
  typography,
} from '../../../theme';
import type { Verse } from '../../../types/quran';
import { toArabicNumber } from '../../../utils/toArabicNumber';
import { VerseFootnotes } from './VerseFootnotes';
import { VerseToolbar } from './VerseToolbar';

interface VerseItemProps {
  verse: Verse;
  isSelected: boolean;
  onSelect: (verseId: string) => void;
  arabicStep: number;
  translationStep: number;
}

/**
 * Typography arrives as props rather than from context on purpose.
 *
 * Reading `useReaderSettings()` here would make every mounted verse re-render
 * whenever any reader setting changed — including ones that do not affect it.
 * As props, `memo` compares them and only rows whose presentation actually
 * changed re-render, and scrolling touches none of this at all.
 */
function VerseItemComponent({
  verse,
  isSelected,
  onSelect,
  arabicStep,
  translationStep,
}: VerseItemProps) {
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    onSelect(verse.id);
  }, [onSelect, verse.id]);

  const arabic = arabicSize(arabicStep);
  const translation = translationSize(translationStep);

  return (
    <View style={[styles.verse, isSelected && styles.verseSelected]}>
      {/*
        The tint stays full-bleed while the text sits in a column. Constraining
        the whole row instead would turn a selected verse into an inset card
        floating on the page, which is exactly what the highlight is meant not
        to look like — and on a landscape screen an unconstrained row would run
        Arabic the full width of the display.
      */}
      <View style={styles.column}>
        {/*
          The toolbar is a sibling of this Pressable, not a child of it —
          nesting it would make every toolbar tap also land on the verse and
          deselect it.
        */}
        <Pressable
          onPress={handlePress}
          // No ripple: the selection highlight is the feedback. A ripple would
          // be louder than anything else on the page.
          android_ripple={null}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={t('reader.verseA11y', {
            ayah: verse.numberInSurah,
            translation: verse.translation,
          })}
        >
          {/*
            Selection fills the badge rather than tinting the page green. It is
            the one mark on the row small enough to carry the accent at full
            strength without the colour competing with the Quran.
          */}
          <View style={[styles.numberBadge, isSelected && styles.numberBadgeSelected]}>
            <Text
              style={[styles.numberText, isSelected && styles.numberTextSelected]}
              maxFontSizeMultiplier={1.2}
            >
              {toArabicNumber(verse.numberInSurah)}
            </Text>
          </View>

          <Text style={[styles.arabic, arabic]}>{verse.arabic}</Text>

          <Text style={[styles.translation, translation]}>{verse.translation}</Text>
        </Pressable>

        {/*
          Siblings of the Pressable, not children: nested, every tap on them
          would also land on the verse and toggle its selection.
        */}
        {verse.footnotes && (
          <VerseFootnotes footnotes={verse.footnotes} textSize={translation} />
        )}

        {isSelected && <VerseToolbar />}
      </View>
    </View>
  );
}

/**
 * Memoized so that selecting one verse does not re-render the rest of the
 * surah — Al-Baqarah has 286 verses and this list will carry all of them.
 */
export const VerseItem = memo(VerseItemComponent);

const styles = StyleSheet.create({
  verse: {
    // 18 inside / 8 between gives ~44pt of air between verses. The inner
    // padding stays larger than the outer margin so a selected verse reads as
    // one settled block rather than as text crowded by its own highlight.
    paddingVertical: spacing.md + spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: 'transparent',
  },
  column: {
    width: '100%',
    maxWidth: MAX_READING_WIDTH,
    alignSelf: 'center',
    // Matches the Book-mode page, so switching modes does not shift the margin
    // the text is measured against.
    paddingHorizontal: screenPadding + spacing.xs,
  },
  verseSelected: {
    // Full-bleed and square-cornered on purpose. A rounded, inset block reads
    // as a card sitting on the page; edge-to-edge with no radius reads as the
    // page itself changing tone under the verse — which is the intent.
    backgroundColor: colors.verseSelected,
  },
  numberBadge: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  numberBadgeSelected: {
    backgroundColor: colors.accent,
  },
  numberText: {
    ...typography.verseNumber,
    color: colors.accent,
  },
  numberTextSelected: {
    color: colors.background,
  },
  arabic: {
    ...typography.arabic,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translation: {
    ...typography.translation,
    color: colors.textSecondary,
    marginTop: spacing.md + spacing.xs,
  },
});
