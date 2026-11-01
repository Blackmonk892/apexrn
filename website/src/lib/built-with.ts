export interface BuiltWithEntry {
  label: string;
  /** Files under public/ for each site theme. */
  images: { light: string; dark: string };
  alt: string;
}

const shot = (name: string) => ({
  light: `/built-with/ref-${name}-light.png`,
  dark: `/built-with/ref-${name}-dark.png`,
});

export const BUILT_WITH: BuiltWithEntry[] = [
  { label: "Settings", images: shot("settings"), alt: "Settings screen built from ApexRN parts" },
  { label: "Checkout", images: shot("checkout"), alt: "Checkout screen built from ApexRN parts" },
  { label: "Inbox", images: shot("inbox"), alt: "Inbox screen built from ApexRN parts" },
];
