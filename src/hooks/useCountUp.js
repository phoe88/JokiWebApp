import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

/**
 * Eases a figure towards `target`, starting from the value on screen. Reduced
 * motion and a hidden tab both skip straight to the final number.
 */
export function useCountUp(target, duration = 900) {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);
  const shown = useRef(value);

  useEffect(() => {
    if (reducedMotion || document.hidden || duration === 0) {
      shown.current = target;
      setValue(target);
      return undefined;
    }

    const from = shown.current;
    let frame;
    let start;

    const tick = (time) => {
      start ??= time;
      const progress = Math.min(1, (time - start) / duration);
      const next = from + (target - from) * easeOutCubic(progress);
      shown.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reducedMotion]);

  return reducedMotion ? target : value;
}
