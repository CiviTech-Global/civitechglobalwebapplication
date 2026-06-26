import { Outlet } from 'react-router';
import { FuturisticNavbar } from './FuturisticNavbar';
import { FuturisticFooter } from './FuturisticFooter';
import { SocialPanel } from './SocialPanel';
import { AmbientBackground } from './AmbientBackground';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AmbientBackground />
      <FuturisticNavbar />
      <SocialPanel />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <FuturisticFooter />
    </div>
  );
}
