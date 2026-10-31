import { Platform, Text } from 'react-native';
import { screen } from '@testing-library/react-native';
import Layout from '../src/components/Layout';
import PlaygroundScreen from '../src/screens/PlaygroundScreen';
import { renderWithTheme } from './utils/render';

const win = window as unknown as Record<string, unknown>;

function setWindow(key: string, value: unknown) {
  Object.defineProperty(window, key, { value, configurable: true, writable: true });
}

describe('native globals', () => {
  const original = {
    location: Object.getOwnPropertyDescriptor(window, 'location'),
    addEventListener: Object.getOwnPropertyDescriptor(window, 'addEventListener'),
  };

  afterEach(() => {
    jest.restoreAllMocks();
    for (const key of ['location', 'addEventListener'] as const) {
      const descriptor = original[key];
      if (descriptor) Object.defineProperty(window, key, descriptor);
      else delete win[key];
    }
  });

  it('Layout renders on native without window.location', async () => {
    setWindow('location', undefined);
    await renderWithTheme(
      <Layout title="APEXRN">
        <Text>child</Text>
      </Layout>,
    );
    expect(screen.getByText('child')).toBeTruthy();
    expect(screen.getByText('APEXRN')).toBeTruthy();
  });

  it('PlaygroundScreen mounts on native without window.addEventListener', async () => {
    setWindow('location', { search: '' });
    setWindow('addEventListener', undefined);
    await renderWithTheme(<PlaygroundScreen componentId="button" onBack={() => {}} />);
    expect(screen.getByText('PLAYGROUND · BUTTON')).toBeTruthy();
  });

  it('Layout embed mode still works on web', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    setWindow('location', { search: '?embed=1' });
    await renderWithTheme(
      <Layout title="APEXRN">
        <Text>child</Text>
      </Layout>,
    );
    expect(screen.getByText('child')).toBeTruthy();
    expect(screen.queryByText('APEXRN')).toBeNull();
  });
});
