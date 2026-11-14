import SiteFooter from '../landing/SiteFooter';
import SiteNav from '../landing/SiteNav';

/** The landing page's navbar and footer around a page of its own. */
export default function SitePage({ children }) {
  return (
    <div className="landing">
      <SiteNav />
      <main id="main" tabIndex={-1} className="page-shell min-h-[60vh] pb-20 pt-12 outline-none sm:pt-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
