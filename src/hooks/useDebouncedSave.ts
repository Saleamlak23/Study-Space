import { useEffect, useRef } from 'react';

export function useDebouncedSave(callback: () => void, delay: number, deps: unknown[]) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const timeout = window.setTimeout(() => callbackRef.current(), delay);
    return () => window.clearTimeout(timeout);
    // The dependency list is intentionally supplied by the caller for debounce timing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
