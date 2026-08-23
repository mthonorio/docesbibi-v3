import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * true only after hydration on the client, false during SSR/the first
 * render — the canonical useSyncExternalStore replacement for the
 * useState(false) + useEffect(() => setState(true), []) pattern (which
 * react-hooks/set-state-in-effect flags, correctly: that pattern works but
 * isn't what the hook is for).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
