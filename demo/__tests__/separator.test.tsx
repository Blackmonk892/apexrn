import { StyleSheet } from 'react-native';
import { Separator, borderWidths, presets } from '@apexrn/ui';

import { renderInPalettes } from './utils/render';

const hidden = { includeHiddenElements: true };

function colorsOf(palette: string) {
  const [preset, mode] = palette.split('-') as ['neo' | 'raw', 'light' | 'dark'];
  return presets[preset][mode];
}

describe('Separator', () => {
  it('is a control-width rule in the border colour in every palette', async () => {
    for (const { palette, view } of await renderInPalettes(<Separator testID="rule" />)) {
      const style = StyleSheet.flatten(view.getByTestId('rule', hidden).props.style);
      expect(style.height).toBe(borderWidths.control);
      expect(style.backgroundColor).toBe(colorsOf(palette).border);
    }
  });

  it('swaps the axis when vertical', async () => {
    const [{ view }] = await renderInPalettes(<Separator orientation="vertical" testID="rule" />);
    const style = StyleSheet.flatten(view.getByTestId('rule', hidden).props.style);
    expect(style.width).toBe(borderWidths.control);
    expect(style.height).toBeUndefined();
  });

  it('hides the rule from assistive tech', async () => {
    const [{ view }] = await renderInPalettes(<Separator testID="rule" />);
    const rule = view.getByTestId('rule', hidden);
    expect(rule.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(rule.props.accessibilityElementsHidden).toBe(true);
    expect(view.queryByTestId('rule')).toBeNull();
  });

  it('centres a label in the label variant between two hidden rules', async () => {
    for (const { palette, view } of await renderInPalettes(<Separator label="Account" testID="divider" />)) {
      const row = view.getByTestId('divider', hidden);
      expect(row.children).toHaveLength(3);
      expect(StyleSheet.flatten(row.props.style).flexDirection).toBe('row');

      const rules = view.getAllByTestId('divider-rule', hidden);
      expect(rules).toHaveLength(2);
      for (const rule of rules) {
        const style = StyleSheet.flatten(rule.props.style);
        expect(style.height).toBe(borderWidths.control);
        expect(style.backgroundColor).toBe(colorsOf(palette).border);
        expect(rule.props.importantForAccessibility).toBe('no-hide-descendants');
      }

      const text = StyleSheet.flatten(view.getByText('Account').props.style);
      expect(text.textTransform).toBe('uppercase');
      expect(view.getByText('Account').props.importantForAccessibility).toBeUndefined();
    }
  });
});
