import React from 'react';
import { Platform } from 'react-native';
import { ApexRNProvider, useTheme as useApexTheme, ThemeMode } from '@apexrn/ui';

function initialMode(): ThemeMode {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Hash is `#<screen>:<theme>` or, for the playground, `#playground:<component>:<theme>` —
    // the forced theme is always the last segment, when present.
    const parts = window.location.hash.replace('#', '').split(':');
    const forced = parts[parts.length - 1];
    if (forced === 'light' || forced === 'dark') return forced;
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApexRNProvider defaultMode={initialMode()}>
      {children}
    </ApexRNProvider>
  );
}

export function useShowcaseTheme() {
  const { mode, toggleTheme, isDark, setMode } = useApexTheme();
  return {
    theme: mode,
    toggleTheme,
    isDark,
    setMode,
  };
}