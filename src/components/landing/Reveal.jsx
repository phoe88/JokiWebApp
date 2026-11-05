import { useInView } from '../../hooks/useInView';

/** Fades its content up the first time it scrolls into view. */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, seen] = useInView();

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${seen ? 'reveal--in' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
