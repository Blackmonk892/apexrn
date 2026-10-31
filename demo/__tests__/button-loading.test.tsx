import { StyleSheet } from 'react-native';
import { screen, userEvent } from '@testing-library/react-native';
import { Button } from '@apexrn/ui';
import { renderWithTheme } from './utils/render';

describe('Button loading', () => {
  it('keeps the live look: solid border, full opacity, shadow', async () => {
    await renderWithTheme(<Button loading>Save</Button>);
    const root = screen.getByRole('button');
    const surface = StyleSheet.flatten(root.props.style);
    expect(surface.borderStyle).not.toBe('dashed');
    expect(surface.opacity).not.toBe(0.6);
    expect(screen.getByTestId('brutal-surface-shadow')).toBeTruthy();
  });

  it('swallows presses while loading', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button loading onPress={onPress}>Save</Button>);
    // userEvent drives the host responder handlers; fireEvent.press would walk up to Button's own onPress prop.
    await userEvent.setup().press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
