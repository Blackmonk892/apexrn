export interface BuiltWithEntry {
  label: string;
  /** Path under public/ of the screenshot; null renders the labelled placeholder frame. */
  image: string | null;
}

export const BUILT_WITH: BuiltWithEntry[] = [
  { label: "Settings", image: null },
  { label: "Checkout", image: null },
  { label: "Inbox", image: null },
];
