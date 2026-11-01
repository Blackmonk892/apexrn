const PREFIX = 'apexrn-demo://c/';

/** `apexrn-demo://c/<id>` → the screen id when it is one the demo lists, otherwise null. */
export function screenFromUrl(url: string | null, known: readonly string[]): string | null {
  if (!url || !url.startsWith(PREFIX)) return null;
  const id = url.slice(PREFIX.length).split(/[/?#]/)[0];
  return known.includes(id) ? id : null;
}
