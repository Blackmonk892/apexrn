import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react-native';
import { ApexRNProvider, type PresetName } from '@apexrn/ui';

type Options = { mode?: 'light' | 'dark'; preset?: PresetName };

// RNTL 14 renders asynchronously, so callers must await this.
export async function renderWithTheme(ui: ReactElement, { mode = 'light', preset }: Options = {}) {
  return render(
    <ApexRNProvider defaultMode={mode} preset={preset}>
      {ui}
    </ApexRNProvider>,
  );
}

const PALETTES: { palette: string; preset: PresetName; mode: 'light' | 'dark' }[] = [
  { palette: 'neo-light', preset: 'neo', mode: 'light' },
  { palette: 'neo-dark', preset: 'neo', mode: 'dark' },
  { palette: 'raw-light', preset: 'raw', mode: 'light' },
  { palette: 'raw-dark', preset: 'raw', mode: 'dark' },
];

export async function renderInPalettes(ui: ReactElement) {
  const results: { palette: string; view: RenderResult }[] = [];
  for (const { palette, preset, mode } of PALETTES) {
    results.push({ palette, view: await renderWithTheme(ui, { mode, preset }) });
  }
  return results;
}
