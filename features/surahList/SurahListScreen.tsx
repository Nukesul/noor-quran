import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../../components/BackButton';
import { SURAH_INDEX } from '../../constants/surahIndex';
import { useTranslation } from '../../locales';
import { colors, screenPadding, spacing, typography } from '../../theme';
import type { SurahSummary } from '../../types/quran';
import { SurahListItem } from './components/SurahListItem';

interface SurahListScreenProps {
  onSelectSurah: (surahNumber: number) => void;
  /**
   * Omitted when the list is a root screen with nowhere to go back to; the
   * control is then not rendered at all rather than shown as a dead end.
   */
  onBack?: () => void;
}

/**
 * All 114 surahs, straight from the bundled SURAH_INDEX — no network, no
 * loading state, instant on open.
 *
 * SURAH_INDEX is the single source of truth for surah metadata; this screen
 * only renders it.
 */
export function SurahListScreen({ onSelectSurah, onBack }: SurahListScreenProps) {
  const { t } = useTranslation();

  const renderItem: ListRenderItem<SurahSummary> = useCallback(
    ({ item }) => <SurahListItem surah={item} onSelect={onSelectSurah} />,
    [onSelectSurah],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/*
        Deliberately outside the list, matching the Reader: inside it, getting
        back from surah 114 would mean scrolling up past 113 rows first. iOS has
        no hardware back, so this is the only way out of the list there.
      */}
      {onBack && <BackButton onPress={onBack} accessibilityLabel={t('common.back')} />}

      <FlatList
        data={SURAH_INDEX}
        renderItem={renderItem}
        keyExtractor={(surah) => String(surah.number)}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{t('surahList.title')}</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.surahName,
    color: colors.textPrimary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: screenPadding,
  },
});
