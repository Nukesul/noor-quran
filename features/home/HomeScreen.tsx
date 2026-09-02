import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SURAH_INDEX } from '../../constants/surahIndex';
import { APP_LANGUAGES, LANGUAGE_LABELS, useTranslation } from '../../locales';
import type { ReadingPosition } from '../../services/quran/readingProgress';
import { colors, iconSize, pressedOpacity, screenPadding, spacing, typography } from '../../theme';

interface HomeScreenProps {
  /** Saved reading position. Al-Fatihah 1:1 until something else is opened. */
  position: ReadingPosition;
  onContinueReading: () => void;
  onOpenSurahList: () => void;
  onOpenSettings: () => void;
}

export function HomeScreen({
  position,
  onContinueReading,
  onOpenSurahList,
  onOpenSettings,
}: HomeScreenProps) {
  const { t, surahName, language, setLanguage } = useTranslation();

  // SURAH_INDEX is ordered 1..114 and bundled, so this is a direct hit.
  const surah = SURAH_INDEX[position.surahNumber - 1] ?? SURAH_INDEX[0];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Noor Quran</Text>

        <Text style={styles.sectionLabel}>{t('home.continueReading')}</Text>

        <Pressable
          onPress={onContinueReading}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t('home.continueReadingA11y', {
            name: surahName(surah),
            surah: surah.number,
            ayah: position.ayahNumber,
          })}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={styles.rowText}>
            <Text style={styles.surahName}>{surahName(surah)}</Text>
            <Text style={styles.surahMeta}>
              {t('home.positionMeta', { surah: surah.number, ayah: position.ayahNumber })}
            </Text>
          </View>

          <Feather name="chevron-right" size={iconSize.navigation} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={onOpenSurahList}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t('home.allSurahsA11y')}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <Text style={styles.linkText}>{t('home.allSurahs')}</Text>
          <Feather name="chevron-right" size={iconSize.navigation} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={onOpenSettings}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t('home.settingsA11y')}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <Text style={styles.linkText}>{t('home.settings')}</Text>
          <Feather name="chevron-right" size={iconSize.navigation} color={colors.textSecondary} />
        </Pressable>

        {/*
          Language selector. Deliberately a quiet row of words at the foot of
          the page rather than a settings card: all three options are visible at
          once, switching is one tap, and nothing competes with the reading
          actions above it.
        */}
        <View style={styles.spacer} />

        <View style={styles.languageRow} accessibilityLabel={t('language.a11y')}>
          {APP_LANGUAGES.map((option) => {
            const isActive = option === language;

            return (
              <Pressable
                key={option}
                onPress={() => setLanguage(option)}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={LANGUAGE_LABELS[option]}
                style={({ pressed }) => [styles.languageOption, pressed && styles.languagePressed]}
              >
                <Text style={[styles.languageText, isActive && styles.languageTextActive]}>
                  {LANGUAGE_LABELS[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: screenPadding,
    paddingTop: spacing.xxl,
  },
  title: {
    ...typography.surahName,
    color: colors.textPrimary,
    // The one large gap on the screen: the title should feel like a cover page,
    // not a header bolted to a list.
    marginBottom: spacing.xxl + spacing.xl,
  },
  sectionLabel: {
    ...typography.surahLabel,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Bleeds into the page margin so the press state reads as the page
    // deepening, the same way a selected verse does in the Reader.
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.verseSelected,
  },
  rowText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  surahName: {
    ...typography.surahName,
    fontSize: 22,
    lineHeight: 30,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  surahMeta: {
    ...typography.surahMeta,
    color: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  linkText: {
    ...typography.translation,
    color: colors.textPrimary,
  },
  /** Pushes the language row to the foot of the page. */
  spacer: {
    flex: 1,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // Same optical pull-back as the rows above, so the first word lines up with
    // the page margin rather than its touch target.
    marginHorizontal: -spacing.md,
    paddingBottom: spacing.md,
  },
  languageOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  languagePressed: {
    opacity: pressedOpacity,
  },
  languageText: {
    ...typography.surahMeta,
    color: colors.textSecondary,
  },
  languageTextActive: {
    color: colors.textPrimary,
  },
});
