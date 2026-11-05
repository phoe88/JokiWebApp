import { useEffect, useRef, useState } from 'react';

/** True once the element has scrolled into view. It stays true afterwards. */
export function useInView() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, seen];
}
