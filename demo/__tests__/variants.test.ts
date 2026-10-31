import type { TextStyle, ViewStyle } from 'react-native';
import { variants } from '@apexrn/ui';

const base: { container: ViewStyle; label: TextStyle } = {
  container: { borderWidth: 2, padding: 8 },
  label: { fontWeight: '700' },
};

const button = variants({
  base,
  variants: {
    variant: {
      primary: { container: { backgroundColor: 'P' }, label: { color: 'PL' } },
      ghost: { container: { backgroundColor: 'transparent' } },
    },
    size: {
      sm: { container: { padding: 4 } },
      md: { container: { padding: 12 }, label: { fontSize: 16 } },
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

const primaryMd = {
  container: { borderWidth: 2, padding: 12, backgroundColor: 'P' },
  label: { fontWeight: '700', color: 'PL', fontSize: 16 },
};

describe('variants', () => {
  it('merges base, then each group in declaration order', () => {
    expect(button()).toEqual(primaryMd);
  });

  it('keeps defaults for groups that are not selected', () => {
    expect(button({ size: 'sm' })).toEqual({
      container: { borderWidth: 2, padding: 4, backgroundColor: 'P' },
      label: { fontWeight: '700', color: 'PL' },
    });
  });

  it('falls back to the default for an unknown value', () => {
    expect(button({ variant: 'nope' as never })).toEqual(primaryMd);
  });

  it('ignores inherited keys such as toString', () => {
    expect(button({ variant: 'toString' as never })).toEqual(primaryMd);
  });

  it('falls back to the default for null', () => {
    expect(button({ variant: null })).toEqual(primaryMd);
  });

  it('leaves slots a variant does not mention at their base style', () => {
    expect(button({ variant: 'ghost', size: 'sm' }).label).toEqual({ fontWeight: '700' });
  });

  it('returns fresh objects and never mutates base', () => {
    const snapshot = JSON.parse(JSON.stringify(base));
    const a = button();
    a.container.padding = 99;
    expect(base).toEqual(snapshot);
    expect(button().container).not.toBe(a.container);
    expect(button().container.padding).toBe(12);
  });
});
