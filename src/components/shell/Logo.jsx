import { Link } from 'react-router-dom';
import { CodeXml } from 'lucide-react';
import { APP_NAME } from '../../config/brand';

/** The code-bracket mark and the wordmark. The caller decides which shows at which width. */
export default function Logo({ chipClassName = '', wordClassName = '' }) {
  return (
    <Link to="/" aria-label={`${APP_NAME} beranda`} className="logo">
      <span aria-hidden className={`logo__chip ${chipClassName}`}>
        <CodeXml className="size-5" strokeWidth={2.25} />
      </span>
      <span aria-hidden className={`logo__word ${wordClassName}`}>
        {APP_NAME}
        <span className="logo__dot" />
      </span>
    </Link>
  );
}
