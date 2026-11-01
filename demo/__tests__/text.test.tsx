import { StyleSheet } from 'react-native';
import { screen } from '@testing-library/react-native';
import { Text, presets } from '@apexrn/ui';
import { renderWithTheme } from './utils/render';

const flat = (id: string) => StyleSheet.flatten(screen.getByTestId(id).props.style);

describe('Text', () => {
  it.each([
    ['display', 32, 36, '900'],
    ['title', 20, 24, '800'],
    ['strong', 16, 22, '800'],
    ['body', 16, 22, '400'],
    ['label', 12, 16, '700'],
    ['mono', 14, 20, '500'],
  ] as const)('%s uses its size, line height and weight', async (variant, fontSize, lineHeight, fontWeight) => {
    await renderWithTheme(<Text testID="t" variant={variant}>x</Text>);
    expect(flat('t')).toMatchObject({ fontSize, lineHeight, fontWeight });
  });

  it('defaults to body', async () => {
    await renderWithTheme(<Text testID="t">x</Text>);
    expect(flat('t')).toMatchObject({ fontSize: 16 });
  });

  it('sets label uppercase with tracking in the mono family', async () => {
    await renderWithTheme(<Text testID="t" variant="label">x</Text>);
    const style = flat('t');
    expect(style.textTransform).toBe('uppercase');
    expect(style.letterSpacing).toBe(1);
    expect(style.fontFamily).toBeTruthy();
  });

  it('caps font scaling at 1.3', async () => {
    await renderWithTheme(<Text testID="t">x</Text>);
    expect(screen.getByTestId('t').props.maxFontSizeMultiplier).toBe(1.3);
  });

  it('colours muted text with mutedForeground', async () => {
    await renderWithTheme(<Text testID="t" tone="muted">x</Text>, { mode: 'dark' });
    expect(flat('t').color).toBe(presets.neo.dark.mutedForeground);
  });

  it('colours default text with foreground and leaves inherit uncoloured', async () => {
    await renderWithTheme(<><Text testID="a">x</Text><Text testID="b" tone="inherit">x</Text></>);
    expect(flat('a').color).toBe(presets.neo.light.foreground);
    expect(flat('b').color).toBeUndefined();
  });

  it('marks display and title as headers and body as plain text', async () => {
    await renderWithTheme(<><Text testID="t" variant="title">x</Text><Text testID="b">x</Text></>);
    expect(screen.getByTestId('t').props.accessibilityRole).toBe('header');
    expect(screen.getByTestId('b').props.accessibilityRole).toBeUndefined();
  });

  it('lets the consumer override role and style', async () => {
    await renderWithTheme(<Text testID="t" variant="title" accessibilityRole="text" style={{ fontSize: 99 }}>x</Text>);
    expect(screen.getByTestId('t').props.accessibilityRole).toBe('text');
    expect(flat('t').fontSize).toBe(99);
  });
});
