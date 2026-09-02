import Feather from '@expo/vector-icons/Feather';
import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../locales';
import { colors, iconSize, pressedOpacity, spacing, typography } from '../../../theme';

interface VerseFootnotesProps {
  /** The edition's footnote text for this ayah, exactly as published. */
  footnotes: string;
  /**
   * Tracks the translation's size, a little smaller. Notes that stayed fixed
   * while the translation grew would end up the hardest text on the page.
   */
  textSize: { fontSize: number; lineHeight: number };
}

/**
 * Splits the single footnote string into one entry per marker.
 *
 * QuranEnc returns every footnote for an ayah in one string, each prefixed with
 * the same `[n]` marker that appears inline in the translation — and the
 * separator is inconsistent: a space in the English edition, a newline in the
 * Kyrgyz one. Splitting *before* each marker gives one readable line per note
 * whichever it is.
 *
 * Purely presentational: no word is added, removed or reordered, and each entry
 * keeps its own marker, so the numbering stays tied to the text it annotates.
 * Note the numbers run per surah, not per ayah — 2:3 in the English edition
 * carries `[3]` and `[4]` — which is why they are never renumbered.
 */
function splitFootnotes(raw: string): string[] {
  return raw
    .split(/\s*(?=\[\d+\])/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/**
 * Collapsed footnote area under a translation.
 *
 * Rendered only when the ayah actually has footnotes, so editions without them
 * — Kuliev, today — are untouched and cost no extra spacing.
 */
function VerseFootnotesComponent({ footnotes, textSize }: VerseFootnotesProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // A shade under the translation: notes are reference material, not the text
  // being read.
  const noteSize = {
    fontSize: Math.max(12, textSize.fontSize - 2),
    lineHeight: Math.max(18, textSize.lineHeight - 3),
  };

  const toggle = useCallback(() => setIsExpanded((current) => !current), []);

  const entries = splitFootnotes(footnotes);
  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggle}
        android_ripple={null}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={t('reader.footnotes')}
        style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
      >
        <Text style={[styles.toggleText, noteSize]}>{t('reader.footnotes')}</Text>
        <Feather
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={iconSize.action}
          color={colors.textSecondary}
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.entries}>
          {entries.map((entry) => (
            <Text key={entry} style={[styles.entry, noteSize]}>
              {entry}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export const VerseFootnotes = memo(VerseFootnotesComponent);

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  togglePressed: {
    opacity: pressedOpacity,
  },
  toggleText: {
    ...typography.surahMeta,
    color: colors.textSecondary,
  },
  entries: {
    marginTop: spacing.xs,
  },
  entry: {
    ...typography.surahMeta,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
});
