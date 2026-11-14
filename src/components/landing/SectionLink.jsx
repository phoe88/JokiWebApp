import { Link, useLocation } from 'react-router-dom';

/**
 * A link to a landing page section. On the landing page it is a plain anchor so
 * the browser scrolls; elsewhere it routes home and the landing page scrolls to it.
 */
export default function SectionLink({ id, children, ...rest }) {
  const { pathname } = useLocation();

  if (pathname === '/') {
    return (
      <a href={`#${id}`} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={`/#${id}`} {...rest}>
      {children}
    </Link>
  );
}
