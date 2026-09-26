import React, { ReactNode } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, borderWidths } from '../lib/colors';
import { usePressPhysics } from '../lib/usePressPhysics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BorderWidthKey = keyof typeof borderWidths;

// `surfaceStyle` also accepts a Reanimated animated-style object (or an array
// containing one) — BrutalSurface always renders the foreground as an
// Animated-capable component, so consumers that need their own animated
// background (e.g. Checkbox's checked-state fill) can pass it straight in.
export interface BrutalSurfaceProps
  extends Omit<PressableProps, 'style' | 'children'> {
  children?: ReactNode;
  /** Shadow offset in px, e.g. 2/4/6/8. @default 4 */
  offset?: number;
  /** Border thickness preset. @default 'heavy' */
  borderWidth?: BorderWidthKey;
  /** Wires up press physics + haptics. Set false for non-interactive surfaces (Badge, Avatar, a decorative thumb). @default true */
  pressable?: boolean;
  /** Whether the hard shadow backing renders at all — some variants/states (outline, disabled) drop it entirely rather than just freezing it. @default true */
  hasShadow?: boolean;
  /** Matches PressableProps' `disabled` (which allows `null`) so consumers can spread props straight through without a cast. */
  disabled?: boolean | null;
  /** Skip the haptic tick on press-in without disabling the animation. @default true */
  haptics?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
  /** Corner radius for both shadow and surface. Real-brutalism defaults to 0 — only the documented circle exceptions (Avatar, radio dots) should ever pass 999. @default 0 */
  borderRadius?: number;
  /** Style for the outer wrapper (reserves margin for the shadow offset). */
  style?: StyleProp<ViewStyle>;
  /** Style for the foreground surface itself (padding, layout, size, background). Also accepts a Reanimated animated-style object. */
  surfaceStyle?: StyleProp<ViewStyle> | any;
  /** Extra style for the shadow layer — e.g. an animated opacity driven by something other than press (focus, in InputOTP/Input). Also accepts a Reanimated animated-style object. */
  shadowStyle?: StyleProp<ViewStyle> | any;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function BrutalSurface({
  children,
  offset = 4,
  borderWidth = 'heavy',
  pressable = true,
  hasShadow = true,
  disabled = false,
  haptics = true,
  backgroundColor = colors.light.background,
  borderColor = colors.light.border,
  shadowColor = colors.light.shadow,
  borderRadius = 0,
  style,
  surfaceStyle,
  shadowStyle,
  onPressIn,
  onPressOut,
  ...pressableProps
}: BrutalSurfaceProps) {
  const isInteractive = pressable && !disabled;
  const bw = borderWidths[borderWidth];

  const { animatedSurfaceStyle, animatedShadowStyle, handlePressIn, handlePressOut } =
    usePressPhysics({ offset, disabled: !isInteractive, haptics });

  const surfaceContent = [
    styles.surface,
    { backgroundColor, borderColor, borderWidth: bw, borderRadius },
    surfaceStyle,
  ];

  return (
    <View
      style={[
        styles.root,
        hasShadow && { marginBottom: offset, marginRight: offset },
        style,
      ]}
    >
      {hasShadow && (
        <Animated.View
          style={[
            styles.shadow,
            {
              top: offset,
              left: offset,
              right: -offset,
              bottom: -offset,
              backgroundColor: shadowColor,
              borderColor,
              borderWidth: bw,
              borderRadius,
            },
            isInteractive && animatedShadowStyle,
            shadowStyle,
          ]}
        />
      )}

      {pressable ? (
        <AnimatedPressable
          onPressIn={(e) => {
            handlePressIn();
            onPressIn?.(e);
          }}
          onPressOut={(e) => {
            handlePressOut();
            onPressOut?.(e);
          }}
          disabled={disabled}
          style={[styles.surfaceWrap, surfaceContent, isInteractive && animatedSurfaceStyle]}
          {...pressableProps}
        >
          {children}
        </AnimatedPressable>
      ) : (
        <View style={[styles.surfaceWrap, surfaceContent]}>{children}</View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    zIndex: 1,
    borderRadius: 0,
  },
  surfaceWrap: {
    position: 'relative',
    zIndex: 2,
  },
  surface: {
    borderRadius: 0,
  },
});
