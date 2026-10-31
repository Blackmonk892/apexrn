import { useEffect, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { borderWidths, focusRing, opacity } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { usePressPhysics } from '../lib/use-press-physics';

export interface BrutalSurfaceProps
  extends Omit<PressableProps, 'style' | 'children'> {
  children?: ReactNode;
  /** Shadow depth from the theme's elevation ladder. @default 'card' */
  elevation?: 'flat' | 'control' | 'card' | 'overlay';
  /** Border thickness: 2px for controls, 3px for containers. @default 'container' */
  borderWidth?: keyof typeof borderWidths;
  /** Wires up press physics + haptics. Set false for non-interactive surfaces. @default true */
  pressable?: boolean;
  /** Drops the shadow, dashes the border and swallows presses and haptics. */
  disabled?: boolean | null;
  /** Border turns destructive. */
  invalid?: boolean;
  /** Forces the focus ring on; otherwise it follows the pressable's focus. */
  focused?: boolean;
  /** Skip the haptic tick on press-in without disabling the animation. @default true */
  haptics?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
  /** Style for the outer wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Style for the foreground surface itself. */
  surfaceStyle?: StyleProp<ViewStyle | AnimatedStyle<ViewStyle>>;
  /** Extra style for the shadow layer. */
  shadowStyle?: StyleProp<ViewStyle | AnimatedStyle<ViewStyle>>;
}

const PRESS_ONLY_PROPS = ['onPress', 'onLongPress', 'onPressIn', 'onPressOut'] as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BrutalSurface({
  children,
  elevation = 'card',
  borderWidth = 'container',
  pressable = true,
  disabled = false,
  invalid = false,
  focused = false,
  haptics = true,
  backgroundColor,
  borderColor,
  shadowColor,
  style,
  surfaceStyle,
  shadowStyle,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  ...pressableProps
}: BrutalSurfaceProps) {
  const theme = useTheme();
  const [hasFocus, setHasFocus] = useState(false);
  const isDisabled = !!disabled;
  const isInteractive = pressable && !isDisabled;
  // Margin is reserved from the full depth so disabling a control never changes its layout.
  const reserved = theme.elevation[elevation];
  // A disabled surface sits flat on the page: a shadow would still read as raised.
  const depth = isDisabled ? 0 : reserved;
  const bw = borderWidths[borderWidth];
  const ringInset = focusRing.offset + focusRing.width;
  const edge = borderColor ?? theme.colors.border;
  const slab = shadowColor ?? theme.colors.shadow;

  // Focus can't survive the surface going disabled, and onBlur won't fire for it.
  useEffect(() => {
    if (isDisabled) setHasFocus(false);
  }, [isDisabled]);

  const { animatedSurfaceStyle, handlePressIn, handlePressOut } =
    usePressPhysics({ depth, disabled: !isInteractive, haptics });

  const surfaceContent: StyleProp<ViewStyle | AnimatedStyle<ViewStyle>> = [
    {
      backgroundColor: backgroundColor ?? theme.colors.background,
      borderColor: invalid ? theme.colors.destructive : edge,
      borderWidth: bw,
      borderStyle: isDisabled ? 'dashed' : 'solid',
      opacity: isDisabled ? opacity.disabled : 1,
    },
    surfaceStyle,
  ];

  const handleInnerPressIn = (e: GestureResponderEvent) => {
    handlePressIn();
    onPressIn?.(e);
  };

  const handleInnerPressOut = (e: GestureResponderEvent) => {
    handlePressOut();
    onPressOut?.(e);
  };

  return (
    <View style={[styles.root, { marginBottom: reserved, marginRight: reserved }, style]}>
      {depth > 0 && (
        <Animated.View
          testID="brutal-surface-shadow"
          pointerEvents="none"
          style={[
            styles.shadow,
            {
              top: depth,
              left: depth,
              right: -depth,
              bottom: -depth,
              backgroundColor: slab,
              // Same colour as the fill: a border-coloured outline here reads as a second, glowing edge in dark mode.
              borderColor: slab,
              borderWidth: bw,
            },
            shadowStyle,
          ]}
        />
      )}

      {pressable ? (
        <AnimatedPressable
          onPressIn={handleInnerPressIn}
          onPressOut={handleInnerPressOut}
          onFocus={(e) => {
            // react-native-web focuses a Pressable on mouse click; the ring is for keyboard focus only.
            const target = e?.target as unknown as { matches?: (s: string) => boolean } | undefined;
            if (Platform.OS !== 'web' || target?.matches?.(':focus-visible') !== false) setHasFocus(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setHasFocus(false);
            onBlur?.(e);
          }}
          disabled={isDisabled}
          style={[styles.surface, surfaceContent, isInteractive && animatedSurfaceStyle]}
          {...pressableProps}
        >
          {children}
        </AnimatedPressable>
      ) : (
        <NonInteractiveSurface
          surfaceContent={surfaceContent}
          pressableProps={pressableProps}
        >
          {children}
        </NonInteractiveSurface>
      )}

      {/* A sibling of the surface so the sinking press never drags the ring with it. */}
      {!isDisabled && (focused || hasFocus) && (
        <View
          testID="brutal-surface-ring"
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          aria-hidden
          style={[
            styles.ring,
            {
              top: -ringInset,
              left: -ringInset,
              right: -ringInset,
              bottom: -ringInset,
              borderWidth: focusRing.width,
              borderColor: theme.colors.ring,
            },
          ]}
        />
      )}
    </View>
  );
}

/** Forwards view-safe props (a11y, testID, layout) and drops handlers a plain view can't fire. */
function NonInteractiveSurface({
  children,
  surfaceContent,
  pressableProps,
}: {
  children: ReactNode;
  surfaceContent: StyleProp<ViewStyle | AnimatedStyle<ViewStyle>>;
  pressableProps: Omit<PressableProps, 'style' | 'children'>;
}) {
  const viewProps: Record<string, unknown> = { ...pressableProps };
  for (const key of PRESS_ONLY_PROPS) delete viewProps[key];
  // Animated.View so animated styles passed via surfaceStyle still resolve.
  return (
    <Animated.View style={[styles.surface, surfaceContent]} {...(viewProps as ViewProps)}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'relative' },
  shadow: { position: 'absolute', zIndex: 1 },
  surface: { position: 'relative', zIndex: 2, borderRadius: 0 },
  ring: { position: 'absolute', zIndex: 3 },
});

export default BrutalSurface;
