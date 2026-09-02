import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../../components/BackButton';
import { APP_VERSION } from '../../constants/appVersion';
import { useQuranTranslation } from '../../hooks/QuranTranslationProvider';
import { APP_LANGUAGES, LANGUAGE_LABELS, useTranslation, type TranslationKey } from '../../locales';
import type { Edition } from '../../types/quran';
import { colors, iconSize, screenPadding, spacing, typography } from '../../theme';

interface SettingsScreenProps {
  onBack: () => void;
}

/** A labelled group of rows. Plain heading and spacing — no card, no border. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

/**
 * Row label for a translation, chosen by the edition's language rather than by
 * its id, so adding another translation in the same language needs no change
 * here.
 */
const TRANSLATION_LABEL_KEY: Readonly<Record<string, TranslationKey>> = {
  ru: 'settings.translationRussian',
  en: 'settings.translationEnglish',
  ky: 'settings.translationKyrgyz',
};

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { t, language, setLanguage } = useTranslation();
  const { selected, options, selectTranslation } = useQuranTranslation();

  /**
   * Credit for the editions actually on screen, not a fixed pair. Reading in
   * English while the Sources section still credited Kuliev would misstate the
   * attribution the licences require.
   */
  function renderSource(title: string, edition: Edition) {
    return (
      <>
        <Text style={styles.itemLabel}>{title}</Text>
        <Text style={styles.body}>{edition.attribution}</Text>
        {edition.version && <Text style={styles.body}>v{edition.version}</Text>}
        {edition.sourceUrl && <Text style={styles.url}>{edition.sourceUrl}</Text>}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BackButton onPress={onBack} accessibilityLabel={t('common.back')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        <Section title={t('settings.language')}>
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
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Text style={[styles.rowText, isActive && styles.rowTextActive]}>
                  {LANGUAGE_LABELS[option]}
                </Text>

                {isActive && (
                  <Feather name="check" size={iconSize.action} color={colors.accent} />
                )}
              </Pressable>
            );
          })}
        </Section>

        <Section title={t('settings.quranTranslation')}>
          {options.map((option) => {
            const isActive = option.id === selected.id;
            const labelKey = TRANSLATION_LABEL_KEY[option.edition.language];
            const label = labelKey ? t(labelKey) : option.edition.name;

            return (
              <Pressable
                key={option.id}
                onPress={() => selectTranslation(option.id)}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={label}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Text style={[styles.rowText, isActive && styles.rowTextActive]}>{label}</Text>

                {isActive && (
                  <Feather name="check" size={iconSize.action} color={colors.accent} />
                )}
              </Pressable>
            );
          })}
        </Section>

        <Section title={t('settings.about')}>
          <Text style={styles.bodyStrong}>Noor Quran</Text>
          <Text style={styles.body}>{t('settings.aboutDescription')}</Text>
        </Section>

        {/*
          Informational only. The credit lines and URLs are printed exactly as
          they are stored on each Edition — they are the attribution the source
          licences require, not UI copy, so they are not translated and not
          reworded here. See services/quran/editions.ts and docs/07_Data.md.
        */}
        <Section title={t('settings.sources')}>
          {renderSource(t('settings.sourceArabic'), selected.editions.arabic)}

          <View style={styles.itemSpaced}>
            {renderSource(t('settings.sourceTranslation'), selected.editions.translation)}
          </View>
        </Section>

        <Section title={t('settings.version')}>
          <Text style={styles.body}>{APP_VERSION}</Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.surahName,
    color: colors.textPrimary,
    paddingTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.surahLabel,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Bleeds into the page margin so the press state reads as the page
    // deepening, matching Home and the surah list.
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.verseSelected,
  },
  rowText: {
    ...typography.translation,
    color: colors.textSecondary,
  },
  rowTextActive: {
    color: colors.textPrimary,
  },
  itemLabel: {
    ...typography.translation,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemSpaced: {
    marginTop: spacing.lg,
  },
  bodyStrong: {
    ...typography.translation,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.surahMeta,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  url: {
    ...typography.surahMeta,
    color: colors.accent,
    marginTop: 2,
  },
});
