import { StyleSheet } from 'react-native';
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

  it('mutes the colour when disabled', async () => {
    await renderWithTheme(<Label testID="l" disabled>Username</Label>);
    expect(flat('l').color).toBe(presets.neo.light.mutedForeground);
  });

  it('uses foreground by default', async () => {
    await renderWithTheme(<Label testID="l">Username</Label>, { mode: 'dark' });
    expect(flat('l').color).toBe(presets.neo.dark.foreground);
  });
});
