import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
import Sidebar from './Sidebar';
import TabBar from './TabBar';
import TopBar from './TopBar';

/** The frame around the app pages. The landing page has its own nav and footer. */
export default function AppShell() {
  return (
    <>
      <Sidebar />
      <div className="app-column">
        <TopBar />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <Outlet />
        </main>
        <Footer />
      </div>
      <TabBar />
    </>
  );
}
