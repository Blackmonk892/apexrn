import { screen } from '@testing-library/react-native';
import { Button } from '@apexrn/ui';
import { renderWithTheme } from './utils/render';

describe('test harness', () => {
  it('renders a library component through @apexrn/ui', async () => {
    await renderWithTheme(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('resolves one React copy for lib and test', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    await renderWithTheme(<Button>Save</Button>);
    const messages = errors.mock.calls.map((call) => String(call[0]));
    errors.mockRestore();
    expect(messages.filter((m) => m.includes('Invalid hook call'))).toEqual([]);
  });

  it('renders in dark mode', async () => {
    await renderWithTheme(<Button>Save</Button>, { mode: 'dark' });
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });
});
