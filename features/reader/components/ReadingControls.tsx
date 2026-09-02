import Feather from '@expo/vector-icons/Feather';
import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReaderSettings } from '../../../hooks/ReaderSettingsProvider';
import { useTranslation, type TranslationKey } from '../../../locales';
import {
  colors,
  iconSize,
  MAX_SIZE_STEP,
  MIN_SIZE_STEP,
  pressedOpacity,
  READING_MODES,
  screenPadding,
  spacing,
  touchTarget,
  typography,
  type ReadingMode,
} from '../../../theme';

interface ReadingControlsProps {
  onClose: () => void;
}

const MODE_LABEL_KEY: Record<ReadingMode, TranslationKey> = {
  verse: 'reader.modeVerse',
  book: 'reader.modeBook',
};

/**
 * How large the "Aa" preview is drawn at each step.
 *
 * Its own small scale, not the reading scale: the panel has to show five
 * distinguishable sizes inside one control row, so it compresses the range
 * rather than mirroring the 18–34 the page actually uses.
 */
const SIZE_PREVIEW = [13, 16, 19, 22, 25] as const;

/**
 * A −/+ pair with its label and the level it is currently on.
 *
 * The middle "Aa" is drawn at a size that tracks the step, so the control shows
 * the current size instead of naming it — the reader can see which way the
 * scale runs without a number or a row of dots. Its box is fixed so the buttons
 * do not shuffle sideways as the preview grows.
 *
 * Disabled ends fade rather than disappear, so the row never changes shape.
 */
function SizeRow({
  label,
  step,
  onStep,
}: {
  label: string;
  step: number;
  onStep: (delta: number) => void;
}) {
  const { t } = useTranslation();

  const isSmallest = step <= MIN_SIZE_STEP;
  const isLargest = step >= MAX_SIZE_STEP;

  return (
    <View style={styles.sizeRow}>
      <Text style={styles.sizeLabel}>{label}</Text>

      <View style={styles.sizeButtons}>
        <Pressable
          onPress={() => onStep(-1)}
          disabled={isSmallest}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${t('reader.decrease')}`}
          style={({ pressed }) => [
            styles.sizeButton,
            isSmallest && styles.sizeButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Feather name="minus" size={iconSize.action} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.sizePreviewBox}>
          <Text style={[styles.sizePreview, { fontSize: SIZE_PREVIEW[step] }]}>Aa</Text>
        </View>

        <Pressable
          onPress={() => onStep(1)}
          disabled={isLargest}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${t('reader.increase')}`}
          style={({ pressed }) => [
            styles.sizeButton,
            isLargest && styles.sizeButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Feather name="plus" size={iconSize.action} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * The reading controls panel.
 *
 * Mounted only while open, so it costs nothing during normal reading, and its
 * open/closed state lives in the Reader rather than in context — putting it in
 * context would re-render every visible verse just to show a panel.
 */
function ReadingControlsComponent({ onClose }: ReadingControlsProps) {
  const { t } = useTranslation();
  const {
    mode,
    arabicStep,
    translationStep,
    isFlipped,
    setMode,
    stepArabic,
    stepTranslation,
    toggleFlipped,
  } = useReaderSettings();

  // Absolutely-positioned children ignore the SafeAreaView's padding, so the
  // inset has to be added back by hand or the panel sits over the status bar.
  const insets = useSafeAreaInsets();

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });

  return (
    <>
      {/*
        Catches the tap that dismisses the panel. Transparent and behind it, so
        it never intercepts a tap meant for a control.
      */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('reader.close')}
      />

      <Animated.View
        style={[
          styles.panel,
          // Hangs just under the "Aa" control that opened it.
          { top: insets.top + touchTarget + spacing.xs },
          { opacity: progress, transform: [{ translateY }] },
        ]}
        accessibilityLabel={t('reader.readingControls')}
      >
        <Text style={styles.sectionLabel}>{t('reader.readingStyle')}</Text>

        {READING_MODES.map((option) => {
          const isActive = option === mode;

          return (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(MODE_LABEL_KEY[option])}
              style={({ pressed }) => [styles.modeRow, pressed && styles.pressed]}
            >
              <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                {t(MODE_LABEL_KEY[option])}
              </Text>
              {isActive && (
                <Feather name="check" size={iconSize.action} color={colors.accent} />
              )}
            </Pressable>
          );
        })}

        <View style={styles.divider} />

        <SizeRow label={t('reader.arabicSize')} step={arabicStep} onStep={stepArabic} />

        <SizeRow
          label={t('reader.translationSize')}
          step={translationStep}
          onStep={stepTranslation}
        />

        <View style={styles.divider} />

        {/*
          One quiet row rather than a switch: turning the page over is a thing
          you do, not a setting you configure, and the icon carries its own
          state well enough that a second control would only add weight.
        */}
        <Pressable
          onPress={toggleFlipped}
          accessibilityRole="button"
          accessibilityState={{ selected: isFlipped }}
          accessibilityLabel={t('reader.flip')}
          style={({ pressed }) => [styles.flipRow, pressed && styles.pressed]}
        >
          <Text style={[styles.sizeLabel, isFlipped && styles.flipLabelActive]}>
            {t('reader.flip')}
          </Text>

          <View style={[styles.flipButton, isFlipped && styles.flipButtonActive]}>
            <Feather
              name="rotate-cw"
              size={iconSize.action}
              color={isFlipped ? colors.accent : colors.textSecondary}
            />
          </View>
        </Pressable>
      </Animated.View>
    </>
  );
}

export const ReadingControls = memo(ReadingControlsComponent);

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    right: screenPadding - spacing.md,
    // The one place in the app that floats above the page, so it needs an
    // edge — but a hairline and a soft shadow, not a card.
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minWidth: 232,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionLabel: {
    ...typography.surahLabel,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  modeText: {
    ...typography.translation,
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  sizeLabel: {
    ...typography.surahMeta,
    color: colors.textSecondary,
    flex: 1,
  },
  sizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonDisabled: {
    opacity: 0.25,
  },
  pressed: {
    opacity: pressedOpacity,
  },
  flipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  flipLabelActive: {
    color: colors.textPrimary,
  },
  flipButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButtonActive: {
    // The same soft green the verse-number badge uses — a mark, not a surface.
    backgroundColor: colors.accentSoft,
    borderRadius: touchTarget / 2,
  },
  sizePreviewBox: {
    // Fixed so the − and + stay put while the preview inside changes size.
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizePreview: {
    color: colors.textPrimary,
  },
});
