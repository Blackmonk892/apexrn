// Minimal typed postMessage protocol between the website (parent) and this
// preview runtime (iframe). Keep this the single source of truth for the
// message shapes both sides use.

import { Platform } from 'react-native';

export type PreviewTheme = 'light' | 'dark' | 'system';

/** parent -> preview: render (or re-render) a named @apexrn/ui export with props. */
export interface RenderMessage {
  type: 'apexrn:render';
  component: string;
  props?: Record<string, unknown>;
  theme?: PreviewTheme;
}

/** parent -> preview: switch colour mode without remounting the tree. */
export interface ThemeMessage {
  type: 'apexrn:theme';
  mode: 'light' | 'dark';
}

/** parent -> preview: switch the token preset. */
export interface PresetMessage {
  type: 'apexrn:preset';
  preset: 'neo' | 'raw';
}

export type ParentToPreviewMessage = RenderMessage | ThemeMessage | PresetMessage;

/** preview -> parent: mounted and listening. */
export interface ReadyMessage {
  type: 'apexrn:ready';
}

/** preview -> parent: content height changed, so the parent can size the iframe. */
export interface ResizeMessage {
  type: 'apexrn:resize';
  height: number;
}

/** preview -> parent: the requested component failed to render. */
export interface ErrorMessage {
  type: 'apexrn:error';
  message: string;
}

export type PreviewToParentMessage = ReadyMessage | ResizeMessage | ErrorMessage;

/**
 * Optional allowlisted parent origin, set via EXPO_PUBLIC_PARENT_ORIGIN at build
 * time for production deploys. Defaults to '*' (this runtime never handles
 * secrets — it only renders public component demos).
 */
const PARENT_ORIGIN = process.env.EXPO_PUBLIC_PARENT_ORIGIN || '*';

export function postToParent(message: PreviewToParentMessage): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.parent || window.parent === window) return;
  window.parent.postMessage(message, PARENT_ORIGIN);
}

export function isRenderMessage(data: unknown): data is RenderMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'apexrn:render' &&
    typeof (data as { component?: unknown }).component === 'string'
  );
}

export function isThemeMessage(data: unknown): data is ThemeMessage {
  const d = data as { type?: unknown; mode?: unknown } | null;
  return typeof d === 'object' && d !== null && d.type === 'apexrn:theme' && (d.mode === 'light' || d.mode === 'dark');
}

export function isPresetMessage(data: unknown): data is PresetMessage {
  const d = data as { type?: unknown; preset?: unknown } | null;
  return typeof d === 'object' && d !== null && d.type === 'apexrn:preset' && (d.preset === 'neo' || d.preset === 'raw');
}
