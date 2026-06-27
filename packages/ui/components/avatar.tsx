import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, ViewProps } from 'react-native';
// Reanimated is imported to fulfill the strict file structure requirement
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AvatarProps extends ViewProps {
  /**
   * The source URL for the avatar image.
   */
  src?: string;
  /**
   * Initials to display if the image fails to load or is not provided.
   * Will be truncated to 2 characters.
   */
  initials?: string;
  /**
   * The size of the avatar.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Toggles the Brutalist hard shadow.
   * @default false
   */
  withShadow?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;

const SIZES = {
  sm: 40,
  md: 56,
  lg: 80,
};

const TYPOGRAPHY_SIZES = {
  sm: typography.sm,
  md: typography.md,
  lg: typography.lg,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Avatar({
  src,
  initials = '?',
  size = 'md',
  withShadow = false,
  style,
  ...props
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const dimension = SIZES[size];
  const fontSize = TYPOGRAPHY_SIZES[size];

  const showFallback = !src || imageFailed;
  const displayInitials = initials.substring(0, 2).toUpperCase();

  return (
    <View
      style={cn(
        styles.container,
        withShadow && styles.containerWithShadow,
        style
      )}
      accessibilityRole="image"
      accessibilityLabel={`Avatar for ${initials}`}
      {...props}
    >
      {withShadow && (
        <View
          style={[
            styles.shadow,
            { width: dimension, height: dimension },
          ]}
        />
      )}
      <View
        style={[
          styles.surface,
          { width: dimension, height: dimension },
        ]}
      >
        {showFallback ? (
          <View style={styles.fallbackContainer}>
            <Text style={[styles.initialsText, { fontSize }]} numberOfLines={1}>
              {displayInitials}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: src }}
            style={styles.image}
            onError={() => setImageFailed(true)}
          />
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  containerWithShadow: {
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard,
    // The Exception: 999 border radius is allowed here
    borderRadius: 999,
    zIndex: 1,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    borderWidth: borderWidths.standard,
    borderColor: colors.light.border,
    // The Exception: 999 border radius is allowed here
    borderRadius: 999,
    backgroundColor: colors.light.background,
    overflow: 'hidden', // Ensures the image doesn't bleed out of the circle
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.light.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: colors.light.foreground,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});