import { useCallback, useRef, useState } from 'react';

/** Tracks an element's content box. Attach the returned ref callback to it. */
export function useElementSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const observer = useRef(null);

  const ref = useCallback((element) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!element) return;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      );
    };

    measure();
    observer.current = new ResizeObserver(measure);
    observer.current.observe(element);
  }, []);

  return [ref, size];
}
