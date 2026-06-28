import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, X, Sun, Moon, ChevronDown, LogOut, User, LayoutDashboard, Shield, Languages } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useLocale } from '../../hooks/useLocale';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const { t, locale, setLocale, isRtl } = useLocale();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const publicLinks = [
    { to: '/', label: t.nav.home },
    { to: '/products', label: t.nav.products },
    { to: '/services', label: t.nav.services },
    { to: '/opportunities', label: t.nav.opportunities },
    { to: '/about', label: t.nav.about },
    { to: '/support', label: t.nav.support },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleLocale = () => {
    setLocale(locale === 'fa' ? 'en' : 'fa');
  };

  return (
    <nav className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="font-bold text-lg text-text-primary">{t.brand}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link key={link.to} to={link.to} className="px-3 py-2 text-sm text-text-secondary hover:text-brand-green-600 rounded-lg hover:bg-surface-200 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button onClick={toggleLocale} className="p-2 rounded-lg hover:bg-surface-200 transition-colors flex items-center gap-1" title={locale === 'fa' ? 'English' : 'فارسی'}>
              <Languages className="w-5 h-5 text-text-secondary" />
              <span className="text-xs text-text-secondary hidden sm:inline">{locale === 'fa' ? 'EN' : 'FA'}</span>
            </button>

            {/* Theme toggle */}
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-surface-200 transition-colors">
              {isDark ? <Sun className="w-5 h-5 text-text-muted" /> : <Moon className="w-5 h-5 text-text-secondary" />}
            </button>

            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-brand-green-700">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-text-primary">{user?.firstName}</span>
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className={cn('absolute mt-1 w-48 py-1 bg-surface-50 rounded-lg shadow-lg border border-border-default z-20', isRtl ? 'left-0' : 'right-0')}>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-200">
                        <LayoutDashboard className="w-4 h-4" /> {t.nav.dashboard}
                      </Link>
                      <Link to="/dashboard/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-200">
                        <User className="w-4 h-4" /> {t.nav.profile}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-200">
                          <Shield className="w-4 h-4" /> {t.nav.adminPanel}
                        </Link>
                      )}
                      <hr className="my-1 border-border-default" />
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-brand-red-600 hover:bg-brand-red-50">
                        <LogOut className="w-4 h-4" /> {t.nav.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"><Button variant="ghost" size="sm">{t.nav.login}</Button></Link>
                <Link to="/register"><Button size="sm">{t.nav.register}</Button></Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-surface-200">
              {mobileOpen ? <X className="w-5 h-5 text-text-primary" /> : <Menu className="w-5 h-5 text-text-primary" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn('md:hidden border-t border-border-default bg-surface-50', mobileOpen ? 'block' : 'hidden')}>
        <div className="px-4 py-3 space-y-1">
          {publicLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-text-secondary hover:bg-surface-200 hover:text-text-primary rounded-lg">
              {link.label}
            </Link>
          ))}
          <hr className="border-border-default" />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-text-secondary hover:bg-surface-200 hover:text-text-primary rounded-lg">
                {t.nav.dashboard}
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-text-secondary hover:bg-surface-200 hover:text-text-primary rounded-lg">
                  {t.nav.adminPanel}
                </Link>
              )}
              <button onClick={handleLogout} className="block w-full text-start px-3 py-2 text-sm text-brand-red-600 hover:bg-brand-red-50 rounded-lg">
                {t.nav.logout}
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1"><Button variant="outline" size="sm" className="w-full">{t.nav.login}</Button></Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1"><Button size="sm" className="w-full">{t.nav.register}</Button></Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
