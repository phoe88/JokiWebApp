import { useEffect, useState } from 'react';

/** The id of the section crossing the middle of the viewport, for the nav's current link. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
          else setActive((current) => (current === entry.target.id ? null : current));
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );

    ids.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
