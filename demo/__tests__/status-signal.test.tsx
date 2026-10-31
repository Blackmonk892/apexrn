import type { ReactElement } from 'react';
import { screen } from '@testing-library/react-native';
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CheckIcon,
  CloseIcon,
  Toast,
  WarningIcon,
  presets,
  type PresetName,
} from '@apexrn/ui';

import { renderWithTheme } from './utils/render';

type Status = 'destructive' | 'success' | 'warning';
const statuses: Status[] = ['destructive', 'success', 'warning'];
const iconFor = { destructive: CloseIcon, success: CheckIcon, warning: WarningIcon };
const modes = ['light', 'dark'] as const;

const components: Record<string, (variant: Status) => ReactElement> = {
  Toast: (variant) => <Toast visible title="Saved" variant={variant} onDismiss={() => {}} />,
  Alert: (variant) => <Alert title="Saved" variant={variant} />,
  Badge: (variant) => <Badge label="Saved" variant={variant} />,
  Card: (variant) => (
    <Card variant={variant} statusLabel="Saved">
      <CardContent>
        <CardDescription>Changes were stored.</CardDescription>
      </CardContent>
    </Card>
  ),
};

const preset: PresetName = 'raw';
const hidden = { includeHiddenElements: true };

describe('status variants in raw carry an icon and a label', () => {
  for (const [name, build] of Object.entries(components)) {
    for (const mode of modes) {
      it.each(statuses)(`${name} ${mode} %s`, async (variant) => {
        await renderWithTheme(build(variant), { mode, preset });

        expect(screen.getByText('Saved', hidden)).toBeTruthy();
        const icons = screen.getAllByTestId(/^status-icon-/, hidden);
        expect(icons).toHaveLength(1);
        expect(icons[0].props.testID).toBe(`status-icon-${variant}`);
        expect(icons[0].props.children.type).toBe(iconFor[variant]);
      });
    }
  }

  it('Alert default shows the info icon', async () => {
    await renderWithTheme(<Alert title="Heads up" />, { preset });
    expect(screen.getAllByTestId(/^status-icon-/, hidden).map((n) => n.props.testID)).toEqual(['status-icon-info']);
  });

  it('a custom Alert icon replaces the built-in one', async () => {
    await renderWithTheme(<Alert title="Heads up" icon={<></>} />, { preset });
    expect(screen.queryAllByTestId(/^status-icon-/, hidden)).toHaveLength(0);
  });

  it('raw success and warning share one fill, so only the icon tells them apart', () => {
    expect(presets.raw.light.success).toBe(presets.raw.light.warning);
  });
});
