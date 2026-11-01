import type { ComponentType } from 'react';
import * as ApexUI from '@apexrn/ui';
import { resolveShowcase } from './showcases';

/**
 * Looks up a real @apexrn/ui export by name so the parent can request "render
 * Button" without the website duplicating the component's implementation.
 * Only components (not hooks/tokens/types) are resolvable this way.
 */
export function resolveComponent(name: string): ComponentType<any> | null {
  // Parts that need children or data render a composition, chosen by name; props stay the same.
  const showcase = resolveShowcase(name);
  if (showcase) return showcase;
  const exported = (ApexUI as Record<string, unknown>)[name];
  // Plain function components are functions; forwardRef/memo components are
  // objects tagged with a React $$typeof symbol (e.g. Input, Textarea, InputOTP).
  const isPlainComponent = typeof exported === 'function';
  const isWrappedComponent =
    typeof exported === 'object' && exported !== null && '$$typeof' in exported;
  return isPlainComponent || isWrappedComponent ? (exported as ComponentType<any>) : null;
}
