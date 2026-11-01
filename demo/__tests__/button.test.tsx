import { StyleSheet, View } from 'react-native';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { Button, CheckIcon, CloseIcon, WarningIcon, presets } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

const ink = presets.neo.light.foreground;
const HIDDEN = { includeHiddenElements: true };
const statusIcon = { destructive: CloseIcon, success: CheckIcon, warning: WarningIcon };

describe('Button', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Button>Save changes</Button>);
    expect(results).toHaveLength(4);
    for (const { view } of results) expect(view.getByRole('button', { name: 'Save changes' })).toBeTruthy();
  });

  it('reads each variant fill from its own role pair', async () => {
    const pairs = {
      primary: ['primary', 'primaryForeground'],
      secondary: ['secondary', 'secondaryForeground'],
      destructive: ['destructive', 'destructiveForeground'],
      success: ['success', 'successForeground'],
      warning: ['warning', 'warningForeground'],
    } as const;
    const colors = presets.raw.dark;
    for (const variant of Object.keys(pairs) as (keyof typeof pairs)[]) {
      const [bg, fg] = pairs[variant];
      await renderWithTheme(<Button variant={variant}>Go</Button>, { preset: 'raw', mode: 'dark' });
      expect(StyleSheet.flatten(screen.getByRole('button').props.style).backgroundColor).toBe(colors[bg]);
      expect(StyleSheet.flatten(screen.getByText('Go').props.style).color).toBe(colors[fg]);
    }
  });

  it('fires onPress from title or children', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button title="Send" onPress={onPress} />);
    await userEvent.setup().press(screen.getByRole('button', { name: 'Send' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled and reports the disabled state', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button disabled onPress={onPress}>Send</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.setup().press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('keeps the variant fill when disabled', async () => {
    await renderWithTheme(<Button variant="primary" disabled>Send</Button>);
    const surface = StyleSheet.flatten(screen.getByRole('button').props.style);
    expect(surface.backgroundColor).toBe(presets.neo.light.primary);
    expect(surface.borderStyle).toBe('dashed');
  });

  it('passes testID to the pressable', async () => {
    await renderWithTheme(<Button testID="button-primary">Send</Button>);
    expect(screen.getByTestId('button-primary')).toBe(screen.getByRole('button'));
  });

  it('sizes the surface 40 / 48 / 56', async () => {
    for (const [size, height] of [['sm', 40], ['md', 48], ['lg', 56]] as const) {
      await renderWithTheme(<Button size={size}>Save</Button>);
      expect(StyleSheet.flatten(screen.getByRole('button').props.style).minHeight).toBe(height);
    }
  });

  it('gives ghost no depth and the others a shadow', async () => {
    await renderWithTheme(<Button variant="ghost">Skip</Button>);
    expect(screen.queryByTestId('brutal-surface-shadow')).toBeNull();
    await renderWithTheme(<Button variant="primary">Skip</Button>);
    expect(screen.getByTestId('brutal-surface-shadow')).toBeTruthy();
  });

  it('sets a sentence-case label in title weight', async () => {
    await renderWithTheme(<Button>Save changes</Button>);
    const style = StyleSheet.flatten(screen.getByText('Save changes').props.style);
    expect(style.fontWeight).toBe('800');
    expect(style.textTransform).toBeUndefined();
  });

  it('shows the muted pair on ghost while held', async () => {
    await renderWithTheme(<Button variant="ghost" testID="g">Skip</Button>);
    const fill = () => StyleSheet.flatten(screen.getByTestId('g').props.style).backgroundColor;
    const ink = () => StyleSheet.flatten(screen.getByText('Skip').props.style).color;
    const idle = fill();
    await fireEvent(screen.getByTestId('g'), 'pressIn');
    expect(fill()).toBe(presets.neo.light.muted);
    expect(ink()).toBe(presets.neo.light.mutedForeground);
    await fireEvent(screen.getByTestId('g'), 'pressOut');
    expect(fill()).toBe(idle);
  });

  it('keeps the dashed border on a disabled ghost', async () => {
    await renderWithTheme(<Button variant="ghost" disabled>Skip</Button>);
    expect(StyleSheet.flatten(screen.getByRole('button').props.style).borderStyle).toBe('dashed');
  });

  describe('loading', () => {
    it('reports busy, not disabled, and keeps the live look', async () => {
      await renderWithTheme(<Button loading>Save</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeBusy();
      expect(button).not.toBeDisabled();
      expect(StyleSheet.flatten(button.props.style).borderStyle).toBe('solid');
      expect(screen.getByTestId('brutal-surface-shadow')).toBeTruthy();
    });

    it('swallows presses', async () => {
      const onPress = jest.fn();
      await renderWithTheme(<Button loading onPress={onPress}>Save</Button>);
      await userEvent.setup().press(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('shows blocks and keeps the label laid out so the width holds', async () => {
      await renderWithTheme(<Button loading>Save changes</Button>);
      expect(screen.getAllByTestId('loading-block', HIDDEN)).toHaveLength(3);
      const label = screen.getByText('Save changes', HIDDEN);
      expect(StyleSheet.flatten(label.parent!.props.style).opacity).toBe(0);
    });

    it('positions the blocks absolutely over a label that stays mounted', async () => {
      await renderWithTheme(<Button loading>Save changes</Button>);
      const block = screen.getAllByTestId('loading-block', HIDDEN)[0];
      let node = block.parent;
      let absolute = false;
      while (node && node !== screen.getByRole('button')) {
        if (StyleSheet.flatten(node.props.style)?.position === 'absolute') absolute = true;
        node = node.parent;
      }
      expect(absolute).toBe(true);
      expect(screen.getByText('Save changes', HIDDEN)).toBeTruthy();
    });

    it('keeps the action as its accessible name and does not announce Loading', async () => {
      await renderWithTheme(<Button loading>Save changes</Button>);
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy();
      expect(screen.queryByText('Loading')).toBeNull();
      expect(screen.queryByLabelText('Loading')).toBeNull();
      expect(screen.queryByRole('progressbar')).toBeNull();
    });

    it('falls back to title when children is not a string', async () => {
      await renderWithTheme(<Button title="Save changes"><View /></Button>);
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy();
    });

    it('draws no blocks when idle', async () => {
      await renderWithTheme(<Button>Save changes</Button>);
      expect(screen.queryAllByTestId('loading-block', HIDDEN)).toHaveLength(0);
    });
  });

  describe('status variants', () => {
    it.each(['destructive', 'success', 'warning'] as const)('%s renders its icon and a text label', async (variant) => {
      const results = await renderInPalettes(<Button variant={variant}>Confirm</Button>);
      for (const { view } of results) {
        const icons = view.getAllByTestId(/^status-icon-/, HIDDEN);
        expect(icons).toHaveLength(1);
        expect(icons[0].props.testID).toBe(`status-icon-${variant}`);
        expect(icons[0].props.children.type).toBe(statusIcon[variant]);
        expect(view.getByText('Confirm', HIDDEN)).toBeTruthy();
      }
    });

    it('a custom icon sits beside the status icon, never in place of it', async () => {
      await renderWithTheme(<Button variant="success" icon={<View testID="mine" />} iconPosition="right">Done</Button>);
      expect(screen.getByTestId('status-icon-success', HIDDEN)).toBeTruthy();
      expect(screen.getByTestId('mine', HIDDEN)).toBeTruthy();
    });

    it('hands a function icon each variant label colour', async () => {
      const pairs = {
        primary: 'primaryForeground',
        secondary: 'secondaryForeground',
        outline: 'foreground',
        ghost: 'foreground',
        destructive: 'destructiveForeground',
        success: 'successForeground',
        warning: 'warningForeground',
      } as const;
      for (const variant of Object.keys(pairs) as (keyof typeof pairs)[]) {
        const icon = jest.fn(() => null);
        await renderWithTheme(<Button variant={variant} icon={icon}>Go</Button>, { preset: 'raw', mode: 'light' });
        expect(icon).toHaveBeenCalledWith(presets.raw.light[pairs[variant]]);
      }
    });

    it('plain variants carry no status icon', async () => {
      await renderWithTheme(<Button variant="outline">Cancel</Button>);
      expect(screen.queryAllByTestId(/^status-icon-/, HIDDEN)).toHaveLength(0);
    });
  });

  describe('icon-only', () => {
    afterEach(() => jest.restoreAllMocks());

    it('stays quiet when labelled, then warns once when not', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await renderWithTheme(<Button icon={<CheckIcon color={ink} />} accessibilityLabel="Confirm" />);
      expect(warn).not.toHaveBeenCalled();
      await renderWithTheme(<Button icon={<CheckIcon color={ink} />} />);
      await renderWithTheme(<Button icon={<CheckIcon color={ink} />} />);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});
