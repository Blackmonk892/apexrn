import raw from "@/generated/theme-docs.json";

export interface ThemeToken {
  name: string;
  value: string;
}

export interface PresetTokens {
  light: ThemeToken[];
  dark: ThemeToken[];
  elevation: { name: string; value: number }[];
}

export type PresetKey = "neo" | "raw";

export function getPresetTokens(preset: PresetKey): PresetTokens {
  return (raw as { presets: Record<PresetKey, PresetTokens> }).presets[preset];
}

/** What each colour token is for. Prose only; the values come from colors.ts. */
export const TOKEN_ROLES: Record<string, string> = {
  background: "Screen background.",
  foreground: "Default text on the background.",
  surface: "Fill of cards, sheets and other raised blocks.",
  surfaceForeground: "Text on a surface.",
  muted: "Quiet fills: tracks, skeletons, disabled areas.",
  mutedForeground: "Secondary text and placeholders.",
  primary: "Main action fill.",
  primaryForeground: "Text on primary.",
  secondary: "Second action fill.",
  secondaryForeground: "Text on secondary.",
  accent: "Highlight fill: badges, selected rows.",
  accentForeground: "Text on accent.",
  destructive: "Delete and error fill.",
  destructiveForeground: "Text on destructive.",
  success: "Success fill.",
  successForeground: "Text on success.",
  warning: "Warning fill.",
  warningForeground: "Text on warning.",
  border: "Every border and divider.",
  input: "Border of text fields.",
  ring: "Focus ring.",
  shadow: "Colour of the hard offset shadow.",
  scrim: "Backdrop behind dialogs, sheets and drawers.",
};

export const ELEVATION_ROLES: Record<string, string> = {
  flat: "No shadow: inline content.",
  control: "Buttons, inputs, chips.",
  card: "Cards and list blocks.",
  overlay: "Dialogs, sheets, menus.",
};
