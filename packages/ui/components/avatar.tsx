import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, ViewProps } from 'react-native';

import { colors, typography } from '../lib/colors';
import BrutalSurface from './brutal_surface';

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
// The Exception: 999 border radius is allowed here — a brutalist avatar is
// still conventionally circular, unlike everything else in the library.
const AVATAR_RADIUS = 999;

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
    <BrutalSurface
      style={[styles.container, style]}
      surfaceStyle={{ width: dimension, height: dimension, backgroundColor: colors.light.background, overflow: 'hidden' }}
      offset={SHADOW_OFFSET}
      borderWidth="standard"
      borderRadius={AVATAR_RADIUS}
      pressable={false}
      hasShadow={withShadow}
      accessibilityRole="image"
      accessibilityLabel={`Avatar for ${initials}`}
      {...props}
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
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
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
