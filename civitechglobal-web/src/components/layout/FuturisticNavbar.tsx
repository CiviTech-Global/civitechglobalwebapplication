import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Menu, X, ChevronDown, LogOut, Shield, Languages } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import logoSrc from '../../assets/logos/concept logo - no bg - white.png';

export function FuturisticNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, locale, setLocale, isRtl } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/products', label: t.nav.products },
    { to: '/services', label: t.nav.services },
    { to: '/careers', label: t.nav.careers },
    { to: '/contact', label: t.nav.contact },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleLocale = () => setLocale(locale === 'fa' ? 'en' : 'fa');

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={cn(
      'fixed top-4 inset-x-4 lg:inset-x-8 z-40 rounded-2xl transition-all duration-500',
      scrolled
        ? 'bg-dark-900/80 backdrop-blur-xl border border-dark-700/50 shadow-[0_0_30px_rgba(0,0,0,0.3)]'
        : 'bg-dark-900/40 backdrop-blur-md border border-dark-700/30'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoSrc} alt={t.brand} className="w-9 h-9 object-contain group-hover:drop-shadow-[0_0_10px_rgba(0,128,230,0.4)] transition-all" />
            <span className="font-bold text-lg text-white hidden sm:block">{t.brand}</span>
          </Link>

          {/* Desktop Nav — centered */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'relative px-4 py-2 text-sm rounded-lg transition-all duration-300',
                  isActive(link.to)
                    ? 'text-ocean-400'
                    : 'text-dark-300 hover:text-white'
                )}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 inset-x-2 h-0.5 bg-gradient-to-r from-ocean-500 to-purple-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700/50 transition-colors flex items-center gap-1"
              title={locale === 'fa' ? 'English' : 'فارسی'}
            >
              <Languages className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{locale === 'fa' ? 'EN' : 'FA'}</span>
            </button>

            {isAuthenticated && isAdmin ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-700/50 transition-colors"
                >
                  <div className="w-7 h-7 bg-ocean-900/40 rounded-full flex items-center justify-center border border-ocean-500/30">
                    <span className="text-xs font-medium text-ocean-400">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-dark-400" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={cn(
                          'absolute mt-2 w-48 py-1 bg-dark-800 rounded-xl shadow-xl border border-dark-700 z-20',
                          isRtl ? 'left-0' : 'right-0'
                        )}
                      >
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-dark-300 hover:bg-dark-700 hover:text-white">
                          <Shield className="w-4 h-4" /> {t.nav.adminPanel}
                        </Link>
                        <hr className="my-1 border-dark-700" />
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20">
                          <LogOut className="w-4 h-4" /> {t.nav.logout}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : null}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700/50"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-dark-700/50 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-4 py-2.5 text-sm rounded-lg transition-colors',
                    isActive(link.to)
                      ? 'text-ocean-400 bg-ocean-900/20'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && isAdmin && (
                <>
                  <hr className="border-dark-700" />
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg">
                    {t.nav.adminPanel}
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-start px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 rounded-lg">
                    {t.nav.logout}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
