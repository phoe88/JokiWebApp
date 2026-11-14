import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const TEMPLATES_PATH = '/templates';
const LOGIN_REASON = 'Masuk dulu untuk mulai mencari template website.';

/**
 * A real link to the template page, so it still works as a link. Signed-out
 * visitors get the login form first and land on the page once they are in.
 */
export default function TemplateLink({ children, onClick, ...rest }) {
  const { user, loading, openLogin } = useAuth();

  const handleClick = (event) => {
    onClick?.(event);
    // While the session is still loading, let the page itself decide.
    if (user || loading) return;
    event.preventDefault();
    openLogin(LOGIN_REASON, TEMPLATES_PATH);
  };

  return (
    <Link to={TEMPLATES_PATH} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
