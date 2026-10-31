import { StyleSheet, Text } from 'react-native';
import { screen } from '@testing-library/react-native';
import { Label, presets } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

const flat = (id: string) => StyleSheet.flatten(screen.getByTestId(id).props.style);

describe('Label', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Label>Email address</Label>);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByText('Email address')).toBeTruthy();
    }
  });

  it('uses the label type style', async () => {
    await renderWithTheme(<Label testID="l">Email address</Label>);
    expect(flat('l')).toMatchObject({ textTransform: 'uppercase', fontSize: 12 });
    expect(screen.getByTestId('l').props.maxFontSizeMultiplier).toBe(1.3);
  });

  it('shows a * and announces "required" when required', async () => {
    await renderWithTheme(<Label testID="l" required>Email address</Label>);
    expect(screen.getByText(/\*/)).toBeTruthy();
    expect(screen.getByTestId('l').props.accessibilityLabel).toBe('Email address, required');
  });

  it('adds no mark or announcement when not required', async () => {
    await renderWithTheme(<Label testID="l">Email address</Label>);
    expect(screen.queryByText(/\*/)).toBeNull();
    expect(screen.getByTestId('l').props.accessibilityLabel).toBeUndefined();
  });

  it('keeps a consumer accessibilityLabel and still adds required', async () => {
    await renderWithTheme(<Label testID="l" required accessibilityLabel="Work email">Email</Label>);
    expect(screen.getByTestId('l').props.accessibilityLabel).toBe('Work email, required');
  });

  it('passes nativeID through for accessibilityLabelledBy', async () => {
    await renderWithTheme(<Label testID="l" nativeID="email-label">Email address</Label>);
    expect(screen.getByTestId('l').props.nativeID).toBe('email-label');
  });

  it('does not append ", required" when the label text already says it', async () => {
    await renderWithTheme(<Label testID="l" required>Email (Required)</Label>);
    expect(screen.getByTestId('l').props.accessibilityLabel).toBeUndefined();
    expect(screen.getByTestId('l').props.accessibilityHint).toBeUndefined();
  });

  it('hints "Required" when no string label can be derived', async () => {
    await renderWithTheme(<Label testID="l" required><Text>Name</Text></Label>);
    expect(screen.getByTestId('l').props.accessibilityHint).toBe('Required');
    expect(screen.getByTestId('l').props.accessibilityLabel).toBeUndefined();
  });

  it('hints "Required" for array children', async () => {
    await renderWithTheme(<Label testID="l" required>{'Name'}{' (legal)'}</Label>);
    expect(screen.getByTestId('l').props.accessibilityHint).toBe('Required');
  });

  it('colours text from its own pair in every palette', async () => {
    const results = await renderInPalettes(
      <>
        <Label testID="on">Username</Label>
        <Label testID="off" disabled>Username</Label>
      </>,
    );
    const palettes = { 'neo-light': ['neo', 'light'], 'neo-dark': ['neo', 'dark'], 'raw-light': ['raw', 'light'], 'raw-dark': ['raw', 'dark'] } as const;
    for (const { palette, view } of results) {
      const [preset, mode] = palettes[palette as keyof typeof palettes];
      const colors = presets[preset][mode];
      expect(StyleSheet.flatten(view.getByTestId('on').props.style).color).toBe(colors.foreground);
      expect(StyleSheet.flatten(view.getByTestId('off').props.style).color).toBe(colors.mutedForeground);
    }
  });
});
