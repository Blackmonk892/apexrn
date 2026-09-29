import React from 'react';
import { Platform } from 'react-native';
import { ApexRNProvider, useTheme as useApexTheme, ThemeMode } from '@ui/lib/theme';

function initialMode(): ThemeMode {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const forced = window.location.hash.split(':')[1];
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