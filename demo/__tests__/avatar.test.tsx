import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Avatar } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

// A 1x1 PNG, so no test touches the network.
// Initials are hidden from assistive tech on purpose, so queries must opt in.
const HIDDEN = { includeHiddenElements: true };

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

describe('Avatar', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Avatar name="Ada Lovelace" testID="avatar" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) expect(view.getByText('AL', HIDDEN)).toBeTruthy();
  });

  it('derives two initials from the first and last word of name', async () => {
    await renderWithTheme(<Avatar name="Ada Byron Lovelace" />);
    expect(screen.getByText('AL', HIDDEN)).toBeTruthy();
  });

  it('uses the first letter of a single name', async () => {
    await renderWithTheme(<Avatar name="madonna" />);
    expect(screen.getByText('M', HIDDEN)).toBeTruthy();
  });

  it('does not crash on an empty or blank name', async () => {
    await renderWithTheme(<Avatar name="   " testID="blank" />);
    expect(screen.getByTestId('blank')).toBeTruthy();
    expect(screen.getByText('?', HIDDEN)).toBeTruthy();
  });

  it('prefers explicit initials over name', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" initials="xyz" />);
    expect(screen.getByText('XY', HIDDEN)).toBeTruthy();
  });

  it('labels the image from name', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" src={PIXEL} />);
    expect(screen.getByRole('image', { name: 'Ada Lovelace' })).toBeTruthy();
  });

  it('shows the image, then the initials once it fails to load', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" src={PIXEL} testID="a" />);
    expect(screen.queryByText('AL')).toBeNull();
    await fireEvent(screen.getByTestId('a-image'), 'error');
    expect(screen.getByText('AL', HIDDEN)).toBeTruthy();
    expect(screen.queryByTestId('a-image')).toBeNull();
  });

  it('retries when src changes after a failure', async () => {
    const view = await renderWithTheme(<Avatar name="Ada Lovelace" src="bad" testID="a" />);
    await fireEvent(screen.getByTestId('a-image'), 'error');
    expect(screen.getByText('AL', HIDDEN)).toBeTruthy();
    await view.rerender(<Avatar name="Ada Lovelace" src={PIXEL} testID="a" />);
    expect(screen.getByTestId('a-image')).toBeTruthy();
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

  it('prefers an explicit accessibilityLabel over name', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" accessibilityLabel="Your profile photo" testID="a" />);
    expect(screen.getByTestId('a').props.accessibilityLabel).toBe('Your profile photo');
  });

  it('hides the initials from assistive tech so the label is read once', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" testID="a" />);
    const initials = screen.getByText('AL', HIDDEN);
    const wrapper = initials.parent!;
    expect(wrapper.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(wrapper.props.accessibilityElementsHidden).toBe(true);
    expect(screen.getByTestId('a').props.accessible).toBe(true);
  });

  it('is decorative, hidden from assistive tech, with neither label nor name', async () => {
    await renderWithTheme(<Avatar testID="a" />);
    const node = screen.getByTestId('a', HIDDEN);
    expect(node.props.accessible).toBe(false);
    expect(node.props.accessibilityLabel).toBeUndefined();
    expect(node.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('does not announce large initials as a heading', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" size="lg" />);
    const initials = screen.getByText('AL', HIDDEN);
    expect(initials.props.accessibilityRole).not.toBe('header');
  });

  it('has no shadow', async () => {
    await renderWithTheme(<Avatar name="Ada Lovelace" />);
    expect(screen.queryByTestId('brutal-surface-shadow')).toBeNull();
  });
});
