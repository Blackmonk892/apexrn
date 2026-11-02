import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type Route =
  | { kind: 'example'; slug: string; id: string }
  | { kind: 'showcase' }
  | { kind: 'default' };

/** `#/example/<slug>/<id>` and `#/showcase`; anything else falls through to the query-driven modes. */
export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'example') return { kind: 'example', slug: parts[1] ?? '', id: parts[2] ?? '' };
  if (parts[0] === 'showcase') return { kind: 'showcase' };
  return { kind: 'default' };
}

export function useRoute(): Route {
  const [hash, setHash] = useState(() => (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.hash : ''));
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return parseHash(hash);
}
