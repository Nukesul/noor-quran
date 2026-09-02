import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../locales';
import { colors, screenPadding, spacing, typography } from '../../../theme';
import type { SurahSummary } from '../../../types/quran';

interface SurahListItemProps {
  surah: SurahSummary;
  onSelect: (surahNumber: number) => void;
}

function SurahListItemComponent({ surah, onSelect }: SurahListItemProps) {
  // Reading context rather than taking props keeps `memo` intact for scrolling
  // while still re-rendering every row when the language changes.
  const { t, surahName, versesLabel, revelationLabel } = useTranslation();

  const handlePress = useCallback(() => {
    onSelect(surah.number);
  }, [onSelect, surah.number]);

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={t('surahList.itemA11y', {
        surah: surah.number,
        name: surahName(surah),
        verses: versesLabel(surah.versesCount),
        revelation: revelationLabel(surah.revelationPlace),
      })}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {/* Latin digits, not Arabic-Indic: this is a navigational index rather
          than Quran text, and 114 rows are scanned, not read. */}
      <Text style={styles.number} maxFontSizeMultiplier={1.3}>
        {surah.number}
      </Text>

      <View style={styles.names}>
        <Text style={styles.name} numberOfLines={1}>
          {surahName(surah)}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {versesLabel(surah.versesCount)} · {revelationLabel(surah.revelationPlace)}
        </Text>
      </View>

      <Text style={styles.arabicName} numberOfLines={1}>
        {surah.arabicName}
      </Text>
    </Pressable>
  );
}

/** Memoized — 114 rows, and only the pressed one ever needs to change. */
export const SurahListItem = memo(SurahListItemComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  pressed: {
    // The same warm tone the Reader uses for a selected verse, so touch
    // feedback reads as one language across the app.
    backgroundColor: colors.verseSelected,
  },
  number: {
    ...typography.surahMeta,
    color: colors.accent,
    width: 30,
  },
  names: {
    flex: 1,
    paddingRight: spacing.md,
  },
  name: {
    ...typography.translation,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    ...typography.surahMeta,
    color: colors.textSecondary,
  },
  arabicName: {
    ...typography.surahName,
    fontSize: 19,
    lineHeight: 30,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
