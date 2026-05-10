import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, Wrench, GraduationCap, ShoppingCart, Ticket, Users, FileText, ShieldCheck,
  ChevronLeft, ChevronRight, LogOut, Sun, Moon, Home, Languages
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge';
import { useTheme } from '../../hooks/useTheme';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';

const ALL_PERMISSIONS = ['products', 'services', 'opportunities', 'orders', 'tickets', 'users', 'content', 'analytics'];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const { t, locale, setLocale, isRtl } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userPerms = user?.permissions || [];

  const allLinks = [
    { to: '/admin', icon: LayoutDashboard, label: t.admin.dashboard, end: true, perm: 'dashboard' },
    { to: '/admin/products', icon: Package, label: t.admin.products, perm: 'products' },
    { to: '/admin/services', icon: Wrench, label: t.admin.services, perm: 'services' },
    { to: '/admin/opportunities', icon: GraduationCap, label: t.admin.opportunities, perm: 'opportunities' },
    { to: '/admin/orders', icon: ShoppingCart, label: t.admin.orders, perm: 'orders' },
    { to: '/admin/tickets', icon: Ticket, label: t.admin.tickets, perm: 'tickets' },
    { to: '/admin/users', icon: Users, label: t.admin.users, perm: 'users' },
    { to: '/admin/content', icon: FileText, label: t.admin.content, perm: 'content' },
  ];

  const sidebarLinks = allLinks.filter((link) => isSuperAdmin || link.perm === 'dashboard' || userPerms.includes(link.perm));

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const CollapseIcon = isRtl
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  return (
    <div className="min-h-screen flex bg-dark-50 dark:bg-dark-950">
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 h-full bg-white dark:bg-dark-900 border-dark-200 dark:border-dark-800 transition-all duration-300 z-30 flex flex-col',
        isRtl ? 'right-0 border-l' : 'left-0 border-r',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-dark-200 dark:border-dark-800">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">CT</span>
          </div>
          {!collapsed && <span className="font-bold text-dark-900 dark:text-white">{t.nav.adminPanel}</span>}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = link.end ? location.pathname === link.to : location.pathname.startsWith(link.to);
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
          {isSuperAdmin && (
            <Link
              to="/admin/permissions"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                location.pathname === '/admin/permissions'
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-dark-600 hover:bg-dark-50 dark:text-dark-400 dark:hover:bg-dark-800'
              )}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{t.admin.permissions?.title || 'Permissions'}</span>}
            </Link>
          )}
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

      {/* Main content */}
      <div className={cn('flex-1 transition-all duration-300', collapsed ? (isRtl ? 'mr-16' : 'ml-16') : (isRtl ? 'mr-64' : 'ml-64'))}>
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-dark-200 dark:border-dark-800">
          <div className="flex items-center justify-between px-6 h-14">
            <h2 className="text-sm font-medium text-dark-500 dark:text-dark-400">
              {t.admin.welcomeBack}{isRtl ? '،' : ','} {user?.firstName}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant={isSuperAdmin ? 'warning' : 'info'} className="text-[10px]">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </Badge>
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
