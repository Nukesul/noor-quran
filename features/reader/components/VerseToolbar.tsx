import Feather from '@expo/vector-icons/Feather';
import { memo, useEffect, useRef, type ComponentProps } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';

import { useTranslation } from '../../../locales';
import type { TranslationKey } from '../../../locales';
import { colors, iconSize, pressedOpacity, spacing, touchTarget } from '../../../theme';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface ToolbarAction {
  key: string;
  icon: FeatherIconName;
  labelKey: TranslationKey;
}

/**
 * Placeholder actions.
 *
 * Intentionally inert in this prototype — no bookmarking, audio, translation
 * switching or overflow menu exists yet. They are here to prove the interaction
 * and spacing, and each will be wired up in its own task.
 */
const ACTIONS: readonly ToolbarAction[] = [
  { key: 'bookmark', icon: 'bookmark', labelKey: 'reader.toolbar.bookmark' },
  { key: 'audio', icon: 'play', labelKey: 'reader.toolbar.audio' },
  // `globe` rather than `type`: the "T" glyph reads as a text or font setting,
  // while the globe carries the language metaphor translation UIs have taught.
  { key: 'translation', icon: 'globe', labelKey: 'reader.toolbar.translation' },
  { key: 'more', icon: 'more-horizontal', labelKey: 'reader.toolbar.more' },
] as const;


function VerseToolbarComponent() {
  const { t } = useTranslation();

  // Fade the toolbar in rather than letting it pop. It mounts only while a
  // verse is selected, so animating on mount is enough.
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  });

  return (
    <Animated.View
      style={[styles.container, { opacity: progress, transform: [{ translateY }] }]}
    >
      {ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          onPress={() => {
            // Placeholder — wired up in a later task.
          }}
          // No hitSlop: the target is already 44pt, and padding it further
          // would make neighbouring icons' tap areas overlap.
          accessibilityRole="button"
          accessibilityLabel={t(action.labelKey)}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Feather name={action.icon} size={iconSize.action} color={colors.textSecondary} />
        </Pressable>
      ))}
    </Animated.View>
  );
}

export const VerseToolbar = memo(VerseToolbarComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // Small, because each 44pt target already carries ~12pt of its own optical
    // padding above the icon — a larger margin here reads as a gap, not rhythm.
    marginTop: spacing.xs,
    gap: spacing.xs,
    // Pull the row back so the icons optically align with the translation text
    // instead of the touch targets doing so.
    marginLeft: -(touchTarget - iconSize.action) / 2,
  },
  action: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: {
    opacity: pressedOpacity,
  },
});
