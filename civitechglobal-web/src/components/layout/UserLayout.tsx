import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingCart, Ticket, GraduationCap, User, Home, LogOut, Sun, Moon, Languages, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge';
import { useTheme } from '../../hooks/useTheme';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';

export function UserLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const { t, locale, setLocale, isRtl } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t.dashboard.overview, end: true },
    { to: '/dashboard/orders', icon: ShoppingCart, label: t.dashboard.myOrders },
    { to: '/dashboard/tickets', icon: Ticket, label: t.dashboard.myTickets },
    { to: '/dashboard/opportunities', icon: GraduationCap, label: t.dashboard.myApplications },
    { to: '/dashboard/profile', icon: User, label: t.nav.profile },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const CollapseIcon = isRtl
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  return (
    <div className="min-h-screen flex bg-dark-50 dark:bg-dark-950">
      <aside className={cn(
        'fixed top-0 h-full bg-white dark:bg-dark-900 border-dark-200 dark:border-dark-800 flex flex-col z-30 transition-all duration-300',
        isRtl ? 'right-0 border-l' : 'left-0 border-r',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-dark-200 dark:border-dark-800">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">CT</span>
          </div>
          {!collapsed && <span className="font-bold text-dark-900 dark:text-white">{t.dashboard.title}</span>}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = link.end ? location.pathname === link.to : location.pathname.startsWith(link.to + '/') || location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-dark-600 hover:bg-dark-50 dark:text-dark-400 dark:hover:bg-dark-800'
                )}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-dark-200 dark:border-dark-800 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-600 hover:bg-dark-50 dark:text-dark-400 dark:hover:bg-dark-800">
            <Home className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t.nav.backToSite}</span>}
          </Link>
          <button onClick={() => setLocale(locale === 'fa' ? 'en' : 'fa')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-dark-600 hover:bg-dark-50 dark:text-dark-400 dark:hover:bg-dark-800">
            <Languages className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{locale === 'fa' ? 'English' : 'فارسی'}</span>}
          </button>
          <button onClick={toggle} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-dark-600 hover:bg-dark-50 dark:text-dark-400 dark:hover:bg-dark-800">
            {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!collapsed && <span>{isDark ? t.nav.lightMode : t.nav.darkMode}</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t.nav.logout}</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute top-20 w-6 h-6 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-full flex items-center justify-center shadow-sm hover:bg-dark-50 dark:hover:bg-dark-700',
            isRtl ? '-left-3' : '-right-3'
          )}
        >
          <CollapseIcon className="w-3 h-3" />
        </button>
      </aside>

      <div className={cn('flex-1 transition-all duration-300', collapsed ? (isRtl ? 'mr-16' : 'ml-16') : (isRtl ? 'mr-64' : 'ml-64'))}>
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-dark-200 dark:border-dark-800">
          <div className="flex items-center justify-between px-6 h-14">
            <h2 className="text-sm font-medium text-dark-500 dark:text-dark-400">
              {t.dashboard.welcome}{isRtl ? '،' : ','} {user?.firstName}!
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">User</Badge>
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-700 dark:text-primary-400">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
