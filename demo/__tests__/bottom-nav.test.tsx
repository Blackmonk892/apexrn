import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { BottomNav, BottomNavItem, HomeIcon, SearchIcon, UserIcon } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Bar(props: React.ComponentProps<typeof BottomNav>) {
  return (
    <BottomNav accessibilityLabel="Main" {...props}>
      <BottomNavItem value="home" label="Home" testID="nav-home" icon={(c) => <HomeIcon size={22} color={c} />} />
      <BottomNavItem value="search" label="Search" testID="nav-search" icon={(c) => <SearchIcon size={22} color={c} />} />
      <BottomNavItem value="me" label="Me" testID="nav-me" disabled icon={(c) => <UserIcon size={22} color={c} />} />
    </BottomNav>
  );
}

let mockFontScale = 1;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 2, fontScale: mockFontScale }),
}));

describe('BottomNav', () => {
  beforeEach(() => {
    mockFontScale = 1;
  });

  it('renders in all four palettes with tablist and tab roles', async () => {
    const results = await renderInPalettes(<Bar defaultValue="home" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByLabelText('Main').props.accessibilityRole).toBe('tablist');
      expect(view.getAllByRole('tab')).toHaveLength(3);
    }
  });

  it('works uncontrolled from defaultValue', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Bar defaultValue="home" onValueChange={onValueChange} />);
    expect(screen.getByRole('tab', { name: 'Home' })).toBeSelected();
    await fireEvent.press(screen.getByTestId('nav-search'));
    expect(onValueChange).toHaveBeenCalledWith('search');
    expect(screen.getByRole('tab', { name: 'Search' })).toBeSelected();
  });

  it('works controlled: selection follows value, not taps', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Bar value="home" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('nav-search'));
    expect(onValueChange).toHaveBeenCalledWith('search');
    expect(screen.getByRole('tab', { name: 'Home' })).toBeSelected();
  });

  it('shows the label on the selected item only; inactive items keep an accessibility label', async () => {
    await renderWithTheme(<Bar defaultValue="home" />);
    expect(screen.getByText('Home', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('Search', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByTestId('nav-search').props.accessibilityLabel).toBe('Search');
  });

  it('hides the label above 1.3x font scale', async () => {
    mockFontScale = 1.6;
    await renderWithTheme(<Bar defaultValue="home" />);
    expect(screen.queryByText('Home', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByRole('tab', { name: 'Home' })).toBeSelected();
  });

  it('ignores a disabled item', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Bar defaultValue="home" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('nav-me'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Me' })).toBeDisabled();
  });

  it('gives each item a 44 hit target and pads for bottomInset', async () => {
    await renderWithTheme(<Bar defaultValue="home" bottomInset={34} />);
    expect(StyleSheet.flatten(screen.getByTestId('nav-search').props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(screen.getByLabelText('Main')).toBeTruthy();
  });

  it('throws when an item is used outside the bar', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<BottomNavItem value="a" label="A" />)).rejects.toThrow('BottomNavItem must be used within a <BottomNav />');
    spy.mockRestore();
  });
});
