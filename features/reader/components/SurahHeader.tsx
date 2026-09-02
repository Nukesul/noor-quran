import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../locales';
import { colors, MAX_READING_WIDTH, screenPadding, spacing, typography } from '../../../theme';
import type { Surah } from '../../../types/quran';

interface SurahHeaderProps {
  surah: Surah;
}

function SurahHeaderComponent({ surah }: SurahHeaderProps) {
  const { t, surahName, versesLabel, revelationLabel } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('surah.numberLabel', { number: surah.number })}</Text>
      <Text style={styles.name}>{surahName(surah)}</Text>
      <Text style={styles.meta}>
        {versesLabel(surah.versesCount)} · {revelationLabel(surah.revelationPlace)}
      </Text>
    </View>
  );
}

export const SurahHeader = memo(SurahHeaderComponent);

const styles = StyleSheet.create({
  container: {
    // Shares the reading column so the surah name stays over the text it
    // introduces instead of drifting to the far edge on a wide screen.
    width: '100%',
    maxWidth: MAX_READING_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: screenPadding + spacing.xs,
    paddingTop: spacing.lg,
    // Trimmed by 4 to absorb the verse's new top padding, so the header keeps
    // the same optical separation it had before the verse rhythm changed.
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.surahLabel,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.surahName,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  meta: {
    ...typography.surahMeta,
    color: colors.textSecondary,
  },
});
