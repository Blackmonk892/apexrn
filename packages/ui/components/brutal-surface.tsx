import type { ReactNode } from 'react';
import {
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

import { borderWidths } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { usePressPhysics } from '../lib/use-press-physics';

type BorderWidthKey = keyof typeof borderWidths;

export interface BrutalSurfaceProps
  extends Omit<PressableProps, 'style' | 'children'> {
  children?: ReactNode;
  /** Shadow offset in px, e.g. 2/4/6/8. @default 4 */
  offset?: number;
  /** Border thickness preset. @default 'heavy' */
  borderWidth?: BorderWidthKey;
  /** Wires up press physics + haptics. Set false for non-interactive surfaces. @default true */
  pressable?: boolean;
  /** Whether the hard shadow backing renders at all. @default true */
  hasShadow?: boolean;
  /** Matches PressableProps' disabled (nullable to match React Native types). */
  disabled?: boolean | null;
  /** Skip the haptic tick on press-in without disabling the animation. @default true */
  haptics?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
  /** Corner radius for both shadow and surface. @default 0 */
  borderRadius?: number;
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
  offset = 4,
  borderWidth = 'heavy',
  pressable = true,
  hasShadow = true,
  disabled = false,
  haptics = true,
  backgroundColor,
  borderColor,
  shadowColor,
  borderRadius = 0,
  style,
  surfaceStyle,
  shadowStyle,
  onPressIn,
  onPressOut,
  ...pressableProps
}: BrutalSurfaceProps) {
  const { colors: themeColors } = useTheme();
  const bg = backgroundColor ?? themeColors.background;
  const bc = borderColor ?? themeColors.border;
  const sc = shadowColor ?? themeColors.shadow;
  const isInteractive = pressable && !disabled;
  const bw = borderWidths[borderWidth];

  const { animatedSurfaceStyle, animatedShadowStyle, handlePressIn, handlePressOut } =
    usePressPhysics({ offset, disabled: !isInteractive, haptics });

  const surfaceContent: StyleProp<ViewStyle | AnimatedStyle<ViewStyle>> = [
    styles.surface,
    { backgroundColor: bg, borderColor: bc, borderWidth: bw, borderRadius },
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
              backgroundColor: sc,
              borderColor: bc,
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
          onPressIn={handleInnerPressIn}
          onPressOut={handleInnerPressOut}
          disabled={disabled ?? undefined}
          style={[styles.surfaceWrap, surfaceContent, isInteractive && animatedSurfaceStyle]}
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
    </View>
  );
}

/**
 * Non-interactive rendering path. Forwards view-safe props (a11y, testID,
 * layout) that would otherwise be dropped, while stripping press-only
 * handlers that a plain `View` cannot act on.
 */
function NonInteractiveSurface({
  children,
  surfaceContent,
  pressableProps,
}: {
  children: ReactNode;
  surfaceContent: StyleProp<ViewStyle | AnimatedStyle<ViewStyle>>;
  pressableProps: Omit<PressableProps, 'style' | 'children'>;
}) {
  // Press-only handlers can't fire on a plain view, so drop them.
  const viewProps: Record<string, unknown> = { ...pressableProps };
  for (const key of PRESS_ONLY_PROPS) delete viewProps[key];
  // Animated.View (not plain View) so animated styles passed via
  // surfaceStyle still resolve on non-interactive surfaces.
  return (
    <Animated.View style={[styles.surfaceWrap, surfaceContent]} {...(viewProps as ViewProps)}>
      {children}
    </Animated.View>
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
    elevation: 0,
    borderRadius: 0,
  },
  surfaceWrap: {
    position: 'relative',
    zIndex: 2,
    elevation: 2,
  },
  surface: {
    borderRadius: 0,
  },
});

export default BrutalSurface;
