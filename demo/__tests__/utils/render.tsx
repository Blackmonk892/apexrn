import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
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
