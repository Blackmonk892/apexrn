import React from 'react';
import { View } from 'react-native';
import { Alert, Avatar, Badge, Button, Checkbox, Chip, Progress, Switch } from '@apexrn/ui';

/** Props posted in from the website's playground controls. Values are plain JSON — no functions. */
export type PlaygroundProps = Record<string, string | number | boolean | undefined>;

type Renderer = (props: PlaygroundProps) => React.ReactNode;

/**
 * One renderer per playground-enabled component. Each mounts the real `@apexrn/ui` component with
 * fixed demo content (label/children) and forwards only the serializable props the website can control —
 * keep this in sync with `website/src/lib/playground-config.ts`, which lists the same slugs and prop names.
 */
export const PLAYGROUND_RENDERERS: Record<string, Renderer> = {
  button: (p) => (
    <Button
      variant={(p.variant as 'default' | 'primary' | 'outline' | 'destructive') ?? 'default'}
      size={(p.size as 'sm' | 'md' | 'lg') ?? 'md'}
      disabled={!!p.disabled}
      loading={!!p.loading}
      onPress={() => {}}
    >
      Button
    </Button>
  ),
  badge: (p) => (
    <Badge
      variant={(p.variant as 'default' | 'primary' | 'outline' | 'accent' | 'destructive' | 'success' | 'warning') ?? 'default'}
      withShadow={!!p.withShadow}
      label="Badge"
    />
  ),
  chip: (p) => <Chip label="Filter" selected={!!p.selected} disabled={!!p.disabled} />,
  switch: (p) => <Switch checked={!!p.checked} disabled={!!p.disabled} />,
  checkbox: (p) => <Checkbox checked={!!p.checked} disabled={!!p.disabled} />,
  progress: (p) => (
    <View style={{ width: 220 }}>
      <Progress value={typeof p.value === 'number' ? p.value : 60} withShadow={!!p.withShadow} />
    </View>
  ),
  avatar: (p) => <Avatar initials="AR" size={(p.size as 'sm' | 'md' | 'lg') ?? 'md'} withShadow={!!p.withShadow} />,
  alert: (p) => (
    <Alert
      variant={(p.variant as 'default' | 'destructive' | 'warning' | 'success') ?? 'default'}
      title="Heads up"
      description="This is a live preview."
    />
  ),
};
