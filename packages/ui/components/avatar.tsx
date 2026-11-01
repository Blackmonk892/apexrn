import { useState } from 'react';
import { Image, StyleSheet, View, ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface from './brutal-surface';
import { Text } from './text';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AvatarProps extends ViewProps {
  /** Image URL. A failed load falls back to initials. */
  src?: string;
  /** Who or what this is. Names the avatar for screen readers and supplies initials when `initials` is not set. */
  name?: string;
  /** Overrides the initials derived from `name`. Only the first two letters are shown. */
  initials?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

// ---------------------------------------------------------------------------
// Look
// ---------------------------------------------------------------------------
// Square, not round: zero radius is the system geometry (DESIGN 1.3).
const look = variants({
  base: { surface: { overflow: 'hidden' } as ViewStyle },
  variants: {
    size: {
      sm: { surface: { width: 32, height: 32 } },
      md: { surface: { width: 40, height: 40 } },
      lg: { surface: { width: 56, height: 56 } },
    },
  },
  defaultVariants: { size: 'md' },
});

// Counted by code point so a surrogate pair is not cut in half.
function deriveInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : '';
  return first + last;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Avatar({ src, name, initials, size = 'md', style, testID, accessibilityLabel, ...props }: AvatarProps) {
  const { colors } = useTheme();
  // Remembering which src failed (rather than a boolean) means a new src gets a fresh
  // load attempt with no stale fallback render in between.
  const [failedSrc, setFailedSrc] = useState<string>();

  const showFallback = !src || failedSrc === src;
  const letters = Array.from(initials || deriveInitials(name ?? '') || '?').slice(0, 2).join('').toUpperCase();
  const label = accessibilityLabel ?? name;
  const { surface } = look({ size });

  return (
    <BrutalSurface
      testID={testID}
      style={[styles.outer, style]}
      surfaceStyle={surface}
      elevation="flat"
      borderWidth="control"
      pressable={false}
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      // The label is the whole announcement; the initials inside must not be read a second time.
      // With no label the avatar is decorative and hidden entirely.
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      {...props}
    >
      {showFallback ? (
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[styles.fill, styles.center, { backgroundColor: colors.muted }]}
        >
          {/* Initials are a monogram, not running text, so they stay uppercase at every size.
              The explicit role stops `title` from announcing them as a heading. */}
          <Text variant={size === 'lg' ? 'title' : 'label'} accessibilityRole="text" numberOfLines={1}>
            {letters}
          </Text>
        </View>
      ) : (
        <Image
          testID={testID ? `${testID}-image` : undefined}
          source={{ uri: src }}
          style={styles.fill}
          resizeMode="cover"
          accessible={false}
          onError={() => setFailedSrc(src)}
        />
      )}
    </BrutalSurface>
  );
}

const styles = StyleSheet.create({
  outer: { alignSelf: 'flex-start' },
  fill: { width: '100%', height: '100%' },
  center: { alignItems: 'center', justifyContent: 'center' },
});

export default Avatar;
