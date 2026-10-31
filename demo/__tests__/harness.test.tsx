import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';
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

describe('useReducedMotion mock', () => {
  const Probe = () => <Text>{useReducedMotion() ? 'reduced' : 'full'}</Text>;

  it('can be overridden per test', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const screen = await render(<Probe />);
    expect(screen.getByText('reduced')).toBeTruthy();
  });

  it('defaults to false again on the next test', async () => {
    const screen = await render(<Probe />);
    expect(screen.getByText('full')).toBeTruthy();
  });
});
