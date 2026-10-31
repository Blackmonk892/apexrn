import { Text } from 'react-native';
import { ApexRNProvider, presets, useTheme } from '@apexrn/ui';
import { render } from '@testing-library/react-native';
import { renderWithTheme } from './utils/render';

function Probe({ id }: { id: string }) {
  const { preset, elevation, colors } = useTheme();
  return <Text testID={id}>{`${preset}:${elevation.card}:${colors.background}`}</Text>;
}

describe('presets', () => {
  it('defaults to neo', async () => {
    const screen = await renderWithTheme(<Probe id="p" />);
    expect(screen.getByTestId('p').props.children).toBe(`neo:4:${presets.neo.light.background}`);
  });

  it('falls back to neo light outside any provider', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const screen = await render(<Probe id="p" />);
      expect(screen.getByTestId('p').props.children).toBe(`neo:4:${presets.neo.light.background}`);
      function Scheme() {
        return <Text testID="c">{useTheme().colorScheme}</Text>;
      }
      const scheme = await render(<Scheme />);
      expect(scheme.getByTestId('c').props.children).toBe('light');
    } finally {
      warn.mockRestore();
    }
  });

  it('resolves preset="raw"', async () => {
    const screen = await renderWithTheme(<Probe id="p" />, { preset: 'raw' });
    expect(screen.getByTestId('p').props.children).toBe(`raw:2:${presets.raw.light.background}`);
  });

  it('gives each nested provider its own preset', async () => {
    const screen = await renderWithTheme(
      <>
        <Probe id="outer" />
        <ApexRNProvider preset="raw" defaultMode="light">
          <Probe id="inner" />
        </ApexRNProvider>
      </>,
    );
    expect(screen.getByTestId('outer').props.children).toMatch(/^neo:/);
    expect(screen.getByTestId('inner').props.children).toMatch(/^raw:/);
  });

  it('resolves the dark raw scheme', async () => {
    const screen = await renderWithTheme(<Probe id="p" />, { mode: 'dark', preset: 'raw' });
    expect(screen.getByTestId('p').props.children).toBe(`raw:2:${presets.raw.dark.background}`);
  });

  it('exposes scrim opacity for the resolved scheme', async () => {
    function Scrim() {
      return <Text testID="s">{String(useTheme().scrimOpacity)}</Text>;
    }
    const light = await renderWithTheme(<Scrim />);
    expect(light.getByTestId('s').props.children).toBe('0.5');
    const dark = await renderWithTheme(<Scrim />, { mode: 'dark' });
    expect(dark.getByTestId('s').props.children).toBe('0.7');
  });
});
