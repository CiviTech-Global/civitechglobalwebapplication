import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, Wrench, GraduationCap, ShoppingCart, Ticket, Users, FileText, ShieldCheck,
  ChevronLeft, ChevronRight, LogOut, Home, Languages, Shield, UserPlus, Database
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';
import logoSrc from '../../assets/logos/concept logo - no bg - white.png';

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
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
    { to: '/admin/roles', icon: Shield, label: t.admin.roles, perm: 'roles' },
    { to: '/admin/admins', icon: UserPlus, label: t.admin.admins, perm: 'admins' },
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
    <div className="min-h-screen flex bg-dark-950">
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 h-full bg-dark-900/95 backdrop-blur-md border-dark-700/50 transition-all duration-300 z-30 flex flex-col',
        isRtl ? 'right-0 border-l' : 'left-0 border-r',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-dark-700/50">
          <img src={logoSrc} alt={t.brand} className="w-8 h-8 object-contain shrink-0" />
          {!collapsed && <span className="font-bold text-white">{t.nav.adminPanel}</span>}
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
                    ? 'bg-ocean-600/20 text-ocean-400 border border-ocean-500/30'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200 border border-transparent'
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
                  ? 'bg-ocean-600/20 text-ocean-400 border border-ocean-500/30'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200 border border-transparent'
              )}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{t.admin.permissions?.title || 'Permissions'}</span>}
            </Link>
          )}
          {isSuperAdmin && (
            <Link
              to="/admin/demo-data"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                location.pathname === '/admin/demo-data'
                  ? 'bg-ocean-600/20 text-ocean-400 border border-ocean-500/30'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200 border border-transparent'
              )}
            >
              <Database className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{t.admin.demoData?.title || 'Demo Data'}</span>}
            </Link>
          )}
        </nav>

        <div className="p-2 border-t border-dark-700/50 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-400 hover:bg-dark-800 hover:text-dark-200">
            <Home className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t.nav.backToSite}</span>}
          </Link>
          <button onClick={() => setLocale(locale === 'fa' ? 'en' : 'fa')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-dark-400 hover:bg-dark-800 hover:text-dark-200">
            <Languages className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{locale === 'fa' ? 'English' : 'فارسی'}</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300">
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t.nav.logout}</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute top-20 w-6 h-6 bg-dark-800 border border-dark-700 rounded-full flex items-center justify-center shadow-sm hover:bg-dark-700',
            isRtl ? '-left-3' : '-right-3'
          )}
        >
          <CollapseIcon className="w-3 h-3 text-dark-400" />
        </button>
      </aside>

      {/* Main content */}
      <div className={cn('flex-1 transition-all duration-300', collapsed ? (isRtl ? 'mr-16' : 'ml-16') : (isRtl ? 'mr-64' : 'ml-64'))}>
        <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-md border-b border-dark-700/50">
          <div className="flex items-center justify-between px-6 h-14">
            <h2 className="text-sm font-medium text-dark-400">
              {t.admin.welcomeBack}{isRtl ? '،' : ','} {user?.firstName}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant={isSuperAdmin ? 'warning' : 'info'} className="text-[10px]">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </Badge>
              <div className="w-8 h-8 bg-ocean-900/40 border border-ocean-500/30 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-ocean-400">
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
