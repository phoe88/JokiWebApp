import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import LoginModal from './components/LoginModal';
import AmbientGlow from './components/shell/AmbientGlow';
import AppShell from './components/shell/AppShell';
import { APP_NAME, APP_TAGLINE } from './config/brand';
import { pageLabel } from './config/nav';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import LiveFeed from './pages/LiveFeed';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';
import Services from './pages/Services';
import Terminal from './pages/Terminal';

function useRouteChrome() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
    document.title =
      pathname === '/' ? `${APP_NAME} | ${APP_TAGLINE}` : `${pageLabel(pathname)} | ${APP_NAME}`;
    // The landing page is written in Indonesian and the app pages in English.
    document.documentElement.lang = pathname === '/' ? 'id' : 'en';
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function App() {
  useRouteChrome();

  return (
    <>
      <AmbientGlow />
      <a href="#main" className="btn btn-primary skip-link">
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppShell />}>
          <Route path="/services" element={<Services />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-feed" element={<LiveFeed />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <LoginModal />
    </>
  );
}
