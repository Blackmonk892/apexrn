import { fireEvent, screen } from '@testing-library/react-native';
import { AppBar, AppBarAction, BellIcon, SearchIcon } from '@apexrn/ui';
import { useSharedValue } from 'react-native-reanimated';

import { renderInPalettes, renderWithTheme } from './utils/render';

const bell = (c: string) => <BellIcon size={20} color={c} />;

describe('AppBar', () => {
  it('renders in all four palettes with a header title', async () => {
    const results = await renderInPalettes(
      <AppBar title="Inbox" subtitle="3 unread" onBack={() => {}} trailing={<AppBarAction label="Alerts" icon={bell} />} />,
    );
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('header')).toHaveTextContent('Inbox');
      expect(view.getByLabelText('Go back').props.accessibilityRole).toBe('button');
    }
  });

  it('back and actions fire, with required labels as names', async () => {
    const onBack = jest.fn();
    const onAlerts = jest.fn();
    await renderWithTheme(
      <AppBar title="Inbox" onBack={onBack} backLabel="Back to home" trailing={<AppBarAction label="Alerts" icon={bell} onPress={onAlerts} />} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Back to home' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Alerts' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onAlerts).toHaveBeenCalledTimes(1);
  });

  it('disabled action does not fire and reports state', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<AppBar title="Editor" trailing={<AppBarAction label="Pin" disabled icon={bell} onPress={onPress} />} />);
    const pin = screen.getByRole('button', { name: 'Pin' });
    expect(pin).toBeDisabled();
    await fireEvent.press(pin);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('active action is selected', async () => {
    await renderWithTheme(<AppBar title="Editor" trailing={<AppBarAction label="Pin" active icon={bell} />} />);
    expect(screen.getByRole('button', { name: 'Pin' })).toBeSelected();
  });

  it('large title is the only header and accepts a scroll value', async () => {
    function Large() {
      const scrollY = useSharedValue(0);
      return <AppBar size="large" title="Projects" scrollY={scrollY} topInset={20} trailing={<AppBarAction label="Search" icon={(c) => <SearchIcon size={20} color={c} />} />} />;
    }
    await renderWithTheme(<Large />);
    expect(screen.getAllByRole('header')).toHaveLength(1);
    expect(screen.getByRole('header')).toHaveTextContent('Projects');
  });

  it('warns in development past two actions, counting fragment children', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await renderWithTheme(
      <AppBar
        title="Crowded"
        trailing={
          <>
            <AppBarAction label="One" icon={bell} />
            <AppBarAction label="Two" icon={bell} />
            <AppBarAction label="Three" icon={bell} />
          </>
        }
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('3 trailing actions'));
    warn.mockClear();
    await renderWithTheme(<AppBar title="Fine" trailing={<AppBarAction label="One" icon={bell} />} />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
