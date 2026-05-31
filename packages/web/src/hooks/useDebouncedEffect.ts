import { useEffect, useRef } from "react";

export function useDebouncedEffect(
  fn: () => void | Promise<void>,
  deps: unknown[],
  delayMs: number,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    const t = setTimeout(() => {
      void fnRef.current();
    }, delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
