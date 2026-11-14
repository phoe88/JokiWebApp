import { techFor } from '../../content/techStack';

const SIZES = {
  lg: { chip: 'tech-logo--lg', icon: 'size-5' },
  sm: { chip: 'tech-logo--sm', icon: 'size-[1.125rem]' },
};

/**
 * A row of technology logos, each a link to the technology's official site. The
 * name shows as a tooltip and is read out by screen readers. A name with no logo
 * falls back to a plain text tag.
 */
export default function TechLogos({ names, size = 'sm', label = 'Teknologi', className = '' }) {
  const { chip, icon } = SIZES[size];

  return (
    <ul aria-label={label} className={`flex flex-wrap ${size === 'lg' ? 'gap-2' : 'gap-1.5'} ${className}`}>
      {names.map((name) => {
        const tech = techFor(name);
        if (!tech) {
          return (
            <li key={name} className="tech-tag">
              {name}
            </li>
          );
        }
        return (
          <li key={name}>
            <a
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              title={tech.name}
              aria-label={`${tech.name} (situs resmi, tab baru)`}
              style={{ '--brand': tech.color }}
              className={`tech-logo ${chip}`}
            >
              <svg aria-hidden viewBox="0 0 24 24" className={icon} fill="currentColor">
                <path d={tech.path} />
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
