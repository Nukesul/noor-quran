import Feather from '@expo/vector-icons/Feather';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  colors,
  iconSize,
  pressedOpacity,
  screenPadding,
  spacing,
  touchTarget,
} from '../theme';

interface BackButtonProps {
  onPress: () => void;
  /**
   * Required, not optional: the Reader says "back to the surah list" while the
   * list says "back", and a screen reader should hear the difference.
   */
  accessibilityLabel: string;
}

/**
 * The back control, and the bar it sits in.
 *
 * The Reader and the surah list each had their own copy of this — same chevron,
 * same 44pt box, same optical pull-back, maintained twice. The bar is included
 * rather than left to callers because the alignment is the part that has to
 * match between screens.
 *
 * Kept outside the scrolling list on both screens on purpose: inside one,
 * getting back from ayah 286 or surah 114 would mean scrolling all the way up
 * first.
 */
function BackButtonComponent({ onPress, accessibilityLabel }: BackButtonProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Feather name="chevron-left" size={iconSize.navigation} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

export const BackButton = memo(BackButtonComponent);

const styles = StyleSheet.create({
  bar: {
    // Pulled left so the chevron sits optically on the page margin rather than
    // its touch target doing so.
    paddingLeft: screenPadding - spacing.md,
  },
  button: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: pressedOpacity,
  },
});
