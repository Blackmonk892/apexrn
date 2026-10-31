import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  presets,
} from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const hidden = { includeHiddenElements: true };
const statuses = ['destructive', 'success', 'warning'] as const;

function Composed({ variant }: { variant?: (typeof statuses)[number] | 'default' }) {
  return (
    <Card variant={variant} testID="card">
      <CardHeader>
        <CardTitle>Storage almost full</CardTitle>
        <CardDescription>4.6 of 5 GB used</CardDescription>
      </CardHeader>
      <CardContent>
        <CardDescription>Older exports are archived after 30 days.</CardDescription>
      </CardContent>
      <CardFooter>
        <CardDescription>Updated today</CardDescription>
      </CardFooter>
    </Card>
  );
}

describe('Card', () => {
  it('renders every variant in all four palettes', async () => {
    for (const variant of ['default', ...statuses] as const) {
      const results = await renderInPalettes(<Composed variant={variant} />);
      expect(results).toHaveLength(4);
      for (const { view } of results) {
        expect(view.getByText('Storage almost full', hidden)).toBeTruthy();
        expect(view.getByText('Updated today', hidden)).toBeTruthy();
      }
    }
  });

  it('has no role or press handler when it is not pressable', async () => {
    await renderWithTheme(<Composed />);
    const card = screen.getByTestId('card', hidden);
    expect(card.props.accessibilityRole).toBeUndefined();
    expect(card.props.onClick).toBeUndefined();
  });

  describe('pressable', () => {
    it('is a labelled button that fires onPress', async () => {
      const onPress = jest.fn();
      await renderWithTheme(
        <Card onPress={onPress} accessibilityLabel="Open release notes" accessibilityHint="Opens the notes">
          <CardTitle>Release notes</CardTitle>
        </Card>,
      );
      const card = screen.getByLabelText('Open release notes');
      expect(card.props.accessibilityRole).toBe('button');
      expect(card.props.accessibilityHint).toBe('Opens the notes');
      fireEvent.press(card);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not fire when disabled and reports the state', async () => {
      const onPress = jest.fn();
      await renderWithTheme(
        <Card onPress={onPress} disabled accessibilityLabel="Open release notes">
          <CardTitle>Release notes</CardTitle>
        </Card>,
      );
      const card = screen.getByLabelText('Open release notes');
      fireEvent.press(card);
      expect(onPress).not.toHaveBeenCalled();
      expect(card.props.accessibilityState).toMatchObject({ disabled: true });
    });
  });

  describe('status', () => {
    it('default shows no status icon or label', async () => {
      await renderWithTheme(<Composed />);
      for (const status of statuses) expect(screen.queryByTestId(`status-icon-${status}`, hidden)).toBeNull();
      expect(screen.queryByTestId('card-status-rule', hidden)).toBeNull();
    });

    it.each([
      ['destructive', 'Error'],
      ['success', 'Success'],
      ['warning', 'Warning'],
    ] as const)('%s renders its icon and the label %s in the header', async (variant, label) => {
      await renderWithTheme(<Composed variant={variant} />);
      expect(screen.getByTestId(`status-icon-${variant}`, hidden)).toBeTruthy();
      expect(screen.getByText(label)).toBeTruthy();
    });

    it('draws the top rule in the status colour', async () => {
      await renderWithTheme(<Composed variant="destructive" />, { mode: 'dark', preset: 'raw' });
      const rule = screen.getByTestId('card-status-rule', hidden);
      expect(StyleSheet.flatten(rule.props.style).backgroundColor).toBe(presets.raw.dark.destructive);
    });

    it('accepts a custom status label', async () => {
      await renderWithTheme(
        <Card variant="warning">
          <CardHeader>
            <CardTitle>Payment due</CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText('Warning')).toBeTruthy();
      await renderWithTheme(
        <Card variant="warning" statusLabel="Overdue">
          <CardHeader>
            <CardTitle>Payment due</CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText('Overdue')).toBeTruthy();
    });
  });

  describe('parts', () => {
    it('CardTitle is announced as a heading', async () => {
      await renderWithTheme(<Composed />);
      expect(screen.getByRole('header')).toBeTruthy();
    });

    it.each([
      ['CardHeader', CardHeader],
      ['CardTitle', CardTitle],
      ['CardDescription', CardDescription],
      ['CardContent', CardContent],
      ['CardFooter', CardFooter],
    ] as const)('%s throws outside a Card', async (name, Part) => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(renderWithTheme(<Part>x</Part>)).rejects.toThrow(`${name} must be used within Card`);
      spy.mockRestore();
    });
  });
});
