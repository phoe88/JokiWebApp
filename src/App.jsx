import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import LoginModal from './components/LoginModal';
import AmbientGlow from './components/shell/AmbientGlow';
import { TEMPLATES_PATH } from './components/TemplateLink';
import { APP_NAME, APP_TAGLINE } from './config/brand';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Templates from './pages/Templates';

const PAGE_TITLES = {
  '/': APP_TAGLINE,
  [TEMPLATES_PATH]: 'Template Website',
};

function useRouteChrome() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${PAGE_TITLES[pathname] ?? 'Halaman tidak ditemukan'} | ${APP_NAME}`;
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function App() {
  useRouteChrome();

  return (
    <>
      <AmbientGlow />
      <a href="#main" className="btn btn-primary skip-link">
        Langsung ke konten
      </a>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path={TEMPLATES_PATH} element={<Templates />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <LoginModal />
    </>
  );
}
