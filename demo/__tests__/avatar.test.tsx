import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Avatar } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

// A 1x1 PNG, so no test touches the network.
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

describe('Avatar', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Avatar name="Ada Lovelace" testID="avatar" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) expect(view.getByText('AL')).toBeTruthy();
  });

  it('derives two initials from the first and last word of name', async () => {
    await renderWithTheme(<Avatar name="Ada Byron Lovelace" />);
    expect(screen.getByText('AL')).toBeTruthy();
  });

  it('uses the first letter of a single name', async () => {
    await renderWithTheme(<Avatar name="madonna" />);
    expect(screen.getByText('M')).toBeTruthy();
  });

  it('does not crash on an empty or blank name', async () => {
    await renderWithTheme(<Avatar name="   " testID="blank" />);
    expect(screen.getByTestId('blank')).toBeTruthy();
    expect(screen.getByText('?')).toBeTruthy();
  });

  it('prefers explicit initials over name', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" initials="xyz" />);
    expect(screen.getByText('XY')).toBeTruthy();
  });

  it('labels the image from name', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" src={PIXEL} />);
    expect(screen.getByRole('image', { name: 'Ada Lovelace' })).toBeTruthy();
  });

  it('shows the image, then the initials once it fails to load', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" src={PIXEL} testID="a" />);
    expect(screen.queryByText('AL')).toBeNull();
    await fireEvent(screen.getByTestId('a-image'), 'error');
    expect(screen.getByText('AL')).toBeTruthy();
    expect(screen.queryByTestId('a-image')).toBeNull();
  });

  it('retries when src changes after a failure', async () => {
    const view = await renderWithTheme(<Avatar name="Ada Lovelace" src="bad" testID="a" />);
    await fireEvent(screen.getByTestId('a-image'), 'error');
    expect(screen.getByText('AL')).toBeTruthy();
    view.rerender(<Avatar name="Ada Lovelace" src={PIXEL} testID="a" />);
    expect(await screen.findByTestId('a-image')).toBeTruthy();
  });

  it.each([
    ['sm', 32],
    ['md', 40],
    ['lg', 56],
  ] as const)('%s is %ipx square', async (size, px) => {
    await renderWithTheme(<Avatar name="Ada Lovelace" size={size} testID="a" />);
    expect(StyleSheet.flatten(screen.getByTestId('a').props.style)).toMatchObject({ width: px, height: px });
  });

  it('defaults to 40', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" testID="a" />);
    expect(StyleSheet.flatten(screen.getByTestId('a').props.style)).toMatchObject({ width: 40, height: 40 });
  });

  it('is an image with no label when it has neither name nor initials', async () => {
    await renderWithTheme(<Avatar testID="a" />);
    expect(screen.getByTestId('a').props.accessibilityRole).toBe('image');
    expect(screen.getByTestId('a').props.accessibilityLabel).toBeUndefined();
  });

  it('has no shadow', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" />);
    expect(screen.queryByTestId('brutal-surface-shadow')).toBeNull();
  });
});
