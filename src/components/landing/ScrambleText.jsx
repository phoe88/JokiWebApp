import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const GLYPHS = '01<>/{}[]#$%&*+=_';
const DURATION_MS = 420;

/**
 * The signature hover: the label breaks into code glyphs, then resolves left to
 * right. It listens on the nearest `.glitch-host`, so the whole button or card
 * triggers it. The width is held while it runs so nothing beside it shifts.
 */
export default function ScrambleText({ text, className = '' }) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (reducedMotion) return undefined;

    const label = ref.current;
    const host = label.closest('.glitch-host') ?? label;
    let frame = null;

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = null;
      label.textContent = text;
      label.style.minWidth = '';
    };

    const start = () => {
      if (frame !== null) return;
      label.style.minWidth = `${label.getBoundingClientRect().width}px`;
      const begin = performance.now();

      const tick = (now) => {
        const progress = (now - begin) / DURATION_MS;
        if (progress >= 1) {
          stop();
          return;
        }
        const settled = Math.floor(progress * text.length);
        label.textContent = [...text]
          .map((char, index) =>
            index < settled || char === ' ' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join('');
        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    };

    host.addEventListener('pointerenter', start);
    host.addEventListener('focusin', start);
    return () => {
      host.removeEventListener('pointerenter', start);
      host.removeEventListener('focusin', start);
      stop();
    };
  }, [text, reducedMotion]);

  return (
    <span ref={ref} className={`glitch-text inline-block ${className}`}>
      {text}
    </span>
  );
}
