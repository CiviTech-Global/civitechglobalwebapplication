import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Menu, X, ChevronDown, LogOut, Shield, Languages, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import logoSrc from '../../assets/logos/concept logo - no bg - white.png';

export function FuturisticNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, locale, setLocale, isRtl } = useLocale();
  const { isDark, toggle: toggleTheme } = useTheme();
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
        ? 'bg-surface-50/90 dark:bg-surface-900/90 backdrop-blur-xl border border-border-default shadow-soft-lg'
        : 'bg-surface-50/70 dark:bg-surface-900/60 backdrop-blur-md border border-border-default/60'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logoSrc}
              alt={t.brand}
              className="w-9 h-9 object-contain invert dark:invert-0 group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.35)] transition-all"
            />
            <span className="font-bold text-lg text-text-primary hidden sm:block">{t.brand}</span>
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
                    ? 'text-brand-green-600'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 inset-x-2 h-0.5 bg-gradient-to-r from-brand-green-500 to-brand-amber-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-muted hover:text-brand-amber-600 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
              title={isDark ? t.nav.lightMode : t.nav.darkMode}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleLocale}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors flex items-center gap-1"
              title={locale === 'fa' ? 'English' : 'فارسی'}
            >
              <Languages className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{locale === 'fa' ? 'EN' : 'FA'}</span>
            </button>

            {isAuthenticated && isAdmin ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="w-7 h-7 bg-brand-green-100 dark:bg-brand-green-900/30 rounded-full flex items-center justify-center border border-brand-green-400/40">
                    <span className="text-xs font-medium text-brand-green-700 dark:text-brand-green-400">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-text-muted" />
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
                          'absolute mt-2 w-48 py-1 bg-surface-50 dark:bg-surface-800 rounded-xl shadow-soft-lg border border-border-default z-20',
                          isRtl ? 'left-0' : 'right-0'
                        )}
                      >
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-text-primary">
                          <Shield className="w-4 h-4" /> {t.nav.adminPanel}
                        </Link>
                        <hr className="my-1 border-border-default" />
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-brand-red-600 hover:bg-brand-red-50 dark:hover:bg-brand-red-900/20">
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
              className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-800"
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
            className="md:hidden border-t border-border-default/60 overflow-hidden"
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
                      ? 'text-brand-green-700 dark:text-brand-green-400 bg-brand-green-50 dark:bg-brand-green-900/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && isAdmin && (
                <>
                  <hr className="border-border-default" />
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">
                    {t.nav.adminPanel}
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-start px-4 py-2.5 text-sm text-brand-red-600 hover:bg-brand-red-50 dark:hover:bg-brand-red-900/20 rounded-lg">
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
