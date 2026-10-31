import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { ApexRNProvider } from '@apexrn/ui';

type Options = { mode?: 'light' | 'dark' };

// RNTL 14 renders asynchronously, so callers must await this.
export async function renderWithTheme(ui: ReactElement, { mode = 'light' }: Options = {}) {
  return render(<ApexRNProvider defaultMode={mode}>{ui}</ApexRNProvider>);
}
