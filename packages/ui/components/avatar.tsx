import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, ViewProps } from 'react-native';

import { typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
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
  initials,
  size = 'md',
  withShadow = false,
  style,
  ...props
}: AvatarProps) {
  const { colors } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const dimension = SIZES[size];
  const fontSize = TYPOGRAPHY_SIZES[size];

  // A new src gets a fresh load attempt instead of sticking on the fallback.
  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const showFallback = !src || imageFailed;
  const displayInitials = (initials || '?').substring(0, 2).toUpperCase();

  return (
    <BrutalSurface
      style={[styles.container, style]}
      surfaceStyle={{ width: dimension, height: dimension, backgroundColor: colors.background, overflow: 'hidden' }}
      offset={SHADOW_OFFSET}
      borderWidth="standard"
      borderRadius={AVATAR_RADIUS}
      pressable={false}
      hasShadow={withShadow}
      accessibilityRole="image"
      accessibilityLabel={showFallback ? `Avatar for ${displayInitials}` : 'Avatar image'}
      {...props}
    >
      {showFallback ? (
        <View style={[styles.fallbackContainer, { backgroundColor: colors.muted }]}>
          <Text style={[styles.initialsText, { fontSize, color: colors.foreground }]} numberOfLines={1}>
            {displayInitials}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: src }}
          style={styles.image}
          accessible={false}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
