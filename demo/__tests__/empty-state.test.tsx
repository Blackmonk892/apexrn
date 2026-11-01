import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Full({ onPress }: { onPress?: () => void }) {
  return (
    <EmptyState>
      <EmptyStateIcon testID="icon">
        <Text>icon-glyph</Text>
      </EmptyStateIcon>
      <EmptyStateTitle>Inbox zero</EmptyStateTitle>
      <EmptyStateDescription>Nothing needs you right now.</EmptyStateDescription>
      <EmptyStateActions>
        <Button onPress={onPress}>Compose</Button>
      </EmptyStateActions>
    </EmptyState>
  );
}

describe('EmptyState', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Full />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByText('Inbox zero')).toBeTruthy();
      expect(view.getByText('Nothing needs you right now.')).toBeTruthy();
    }
  });

  it('exposes the title as a header', async () => {
    await renderWithTheme(<Full />);
    expect(screen.getByRole('header', { name: 'Inbox zero' })).toBeTruthy();
  });

  it('hides the icon from assistive tech', async () => {
    await renderWithTheme(<Full />);
    expect(screen.queryByText('icon-glyph')).toBeNull();
    expect(screen.getByText('icon-glyph', { includeHiddenElements: true })).toBeTruthy();
  });

  it('passes the readable colour to a function icon', async () => {
    const render = jest.fn(() => <Text>glyph</Text>);
    await renderWithTheme(
      <EmptyState>
        <EmptyStateIcon>{render}</EmptyStateIcon>
      </EmptyState>,
    );
    expect(render).toHaveBeenCalledWith(expect.stringMatching(/^#/));
  });

  it('presses an action', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Full onPress={onPress} />);
    await fireEvent.press(screen.getByText('Compose'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports start alignment', async () => {
    await renderWithTheme(
      <EmptyState align="start" testID="root">
        <EmptyStateTitle>Left</EmptyStateTitle>
      </EmptyState>,
    );
    expect(screen.getByTestId('root')).toHaveStyle({ alignItems: 'flex-start' });
  });

  it.each([
    ['EmptyStateIcon', () => <EmptyStateIcon>x</EmptyStateIcon>],
    ['EmptyStateTitle', () => <EmptyStateTitle>x</EmptyStateTitle>],
    ['EmptyStateDescription', () => <EmptyStateDescription>x</EmptyStateDescription>],
    ['EmptyStateActions', () => <EmptyStateActions>{null}</EmptyStateActions>],
  ])('%s throws outside EmptyState', async (name, part) => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(part())).rejects.toThrow(`${name} must be used within EmptyState`);
    spy.mockRestore();
  });
});
