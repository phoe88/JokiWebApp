import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CommunitySection from '../components/landing/CommunitySection';
import ConsultModal from '../components/landing/ConsultModal';
import FaqSection from '../components/landing/FaqSection';
import Hero from '../components/landing/Hero';
import MusicDock from '../components/landing/MusicDock';
import PortfolioSection from '../components/landing/PortfolioSection';
import ServicesSection from '../components/landing/ServicesSection';
import SiteFooter from '../components/landing/SiteFooter';
import SiteNav from '../components/landing/SiteNav';

export default function Landing() {
  const { hash } = useLocation();
  const [consultOpen, setConsultOpen] = useState(false);
  const openConsult = () => setConsultOpen(true);

  // The sections only exist once React has rendered, so the browser can't scroll to a
  // deep link like /#faq by itself.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="landing">
      <SiteNav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero onConsult={openConsult} />
        <div className="section-rule" />
        <ServicesSection />
        <PortfolioSection />
        <CommunitySection />
        <FaqSection onConsult={openConsult} />
      </main>
      <SiteFooter />
      <MusicDock />
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </div>
  );
}
