import React from 'react';
import { ApexRNProvider, useTheme as useApexTheme, ThemeMode } from '@ui/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApexRNProvider defaultMode="system">
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