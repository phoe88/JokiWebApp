import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const GLYPHS = '01<>/{}[]#$%&*+=_';
const DURATION_MS = 420;
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Measures where each character of the resting label sits, so the scramble can
 * give every character a fixed-width cell. Width comes from the gap to the next
 * character on the same line, which keeps kerning, or the glyph's own width at
 * a line end.
 */
function measureCells(textNode, text) {
  const range = document.createRange();
  const rects = [...text].map((_, index) => {
    range.setStart(textNode, index);
    range.setEnd(textNode, index + 1);
    return range.getBoundingClientRect();
  });
  return rects.map((rect, index) => {
    const next = rects[index + 1];
    return next && Math.abs(next.top - rect.top) < 1 ? next.left - rect.left : rect.width;
  });
}

/**
 * Builds the scramble layout: words stay unbroken, spaces stay real spaces so
 * wrapping matches the resting text, and each character becomes a cell whose
 * width is locked to the original letter. Glyphs swap inside the cells, so the
 * label never shrinks, grows or shifts.
 */
function buildCells(label, text, widths) {
  const cells = [];
  const fragment = document.createDocumentFragment();
  let word = null;

  [...text].forEach((char, index) => {
    if (char === ' ') {
      word = null;
      fragment.append(' ');
      return;
    }
    if (!word) {
      word = document.createElement('span');
      word.className = 'glitch-word';
      fragment.append(word);
    }
    const cell = document.createElement('span');
    cell.className = 'glitch-cell';
    cell.style.width = `${widths[index]}px`;
    cell.textContent = char;
    word.append(cell);
    cells.push({ cell, index, char });
  });

  label.replaceChildren(fragment);
  return cells;
}

/**
 * The signature hover: the label breaks into code glyphs, then resolves left to
 * right. It listens on the nearest `.glitch-host`, so the whole button or card
 * triggers it. Only the glyphs change; the label keeps its exact size.
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
    };

    const start = () => {
      if (frame !== null) return;
      const textNode = label.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

      const cells = buildCells(label, text, measureCells(textNode, text));
      const begin = performance.now();

      const tick = (now) => {
        const progress = (now - begin) / DURATION_MS;
        if (progress >= 1) {
          stop();
          return;
        }
        const settled = Math.floor(progress * text.length);
        for (const { cell, index, char } of cells) {
          cell.textContent = index < settled ? char : randomGlyph();
        }
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
    <span className={`glitch-text inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
