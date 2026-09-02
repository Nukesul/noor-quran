import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../locales';
import { colors, screenPadding, spacing, typography } from '../../../theme';

/**
 * Decorative Bismillah shown above the first verse.
 *
 * Only for surahs where the Bismillah is not itself an ayah — i.e. every surah
 * except Al-Fatihah (where it is ayah 1) and At-Tawbah (which has none).
 * Rendering is gated by `Surah.showsBismillahHeader`.
 */
function BismillahComponent() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.text} accessibilityLabel={t('reader.bismillahA11y')}>
        ﷽
      </Text>
    </View>
  );
}

export const Bismillah = memo(BismillahComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    marginBottom: spacing.xl + spacing.sm,
  },
  text: {
    ...typography.bismillah,
    color: colors.textPrimary,
  },
});
