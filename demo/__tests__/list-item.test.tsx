import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { ListItem, Text, opacity } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

describe('ListItem', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<ListItem title="Billing" description="Cards and invoices" onPress={() => {}} />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByText('Billing')).toBeTruthy();
      expect(view.getByText('Cards and invoices')).toBeTruthy();
    }
  });

  it('fires onPress and exposes the button role', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<ListItem title="Account" onPress={onPress} testID="row" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Account' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is plain content without onPress: no button role', async () => {
    await renderWithTheme(<ListItem title="Notifications" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Notifications')).toBeTruthy();
  });

  it('does not fire onPress when disabled, and reports the disabled state', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<ListItem title="Delete account" disabled onPress={onPress} testID="row" />);
    await fireEvent.press(screen.getByTestId('row'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeDisabled();
    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).opacity).toBe(opacity.disabled);
  });

  it('fills with muted while pressed', async () => {
    await renderWithTheme(<ListItem title="Account" onPress={() => {}} testID="row" />);
    const row = screen.getByTestId('row');
    const touch = { nativeEvent: { touches: [], changedTouches: [], timestamp: 0 }, persist: () => {} };
    expect(StyleSheet.flatten(row.props.style).backgroundColor).toBeUndefined();
    await fireEvent(row, 'responderGrant', touch);
    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).backgroundColor).toBeTruthy();
  });

  it('is 56 tall with one line and 72 with a description', async () => {
    await renderWithTheme(
      <>
        <ListItem title="One" testID="one" />
        <ListItem title="Two" description="More" testID="two" />
      </>,
    );
    expect(StyleSheet.flatten(screen.getByTestId('one').props.style).minHeight).toBe(56);
    expect(StyleSheet.flatten(screen.getByTestId('two').props.style).minHeight).toBe(72);
  });

  it('truncates the title at two lines and the description at one', async () => {
    await renderWithTheme(<ListItem title="Long title" description="Long description" />);
    expect(screen.getByText('Long title').props.numberOfLines).toBe(2);
    expect(screen.getByText('Long description').props.numberOfLines).toBe(1);
  });

  it('renders leading and trailing slots and a mono meta', async () => {
    await renderWithTheme(
      <ListItem title="Alex" meta="12:30" leading={<Text>L</Text>} trailing={<Text>T</Text>} />,
    );
    expect(screen.getByText('L')).toBeTruthy();
    expect(screen.getByText('T')).toBeTruthy();
    const meta = StyleSheet.flatten(screen.getByText('12:30').props.style);
    expect(meta.fontFamily).toBeTruthy();
  });
});
