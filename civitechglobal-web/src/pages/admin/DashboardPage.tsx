import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingCart, Ticket, Package, DollarSign, Wrench, GraduationCap, AlertCircle, LayoutDashboard } from 'lucide-react';
import api from '../../config/api';
import type { DashboardStats, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router';

export default function AdminDashboard() {
  const { t } = useLocale();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
      return data.data;
    },
    enabled: isSuperAdmin,
  });

  if (isLoading && isSuperAdmin) return <Spinner size="lg" />;

  // Admin (non-superadmin) simplified dashboard
  if (!isSuperAdmin) {
    const userPerms = user?.permissions || [];
    const moduleLinks = [
      { perm: 'products', label: t.admin.products, to: '/admin/products', icon: Package },
      { perm: 'services', label: t.admin.services, to: '/admin/services', icon: Wrench },
      { perm: 'opportunities', label: t.admin.opportunities, to: '/admin/opportunities', icon: GraduationCap },
      { perm: 'orders', label: t.admin.orders, to: '/admin/orders', icon: ShoppingCart },
      { perm: 'tickets', label: t.admin.tickets, to: '/admin/tickets', icon: Ticket },
      { perm: 'users', label: t.admin.users, to: '/admin/users', icon: Users },
      { perm: 'content', label: t.admin.content, to: '/admin/content', icon: LayoutDashboard },
    ];

    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">{t.admin.dashboard}</h1>
        <Card className="mb-6">
          <h2 className="font-semibold text-white mb-2">{t.admin.welcomeBack}</h2>
          <p className="text-dark-400 text-sm">{t.admin.permissions?.description || 'Manage your assigned modules from the sidebar.'}</p>
        </Card>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moduleLinks
            .filter((m) => userPerms.includes(m.perm))
            .map((m) => (
              <Link key={m.perm} to={m.to}>
                <Card hover>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-ocean-900/30 text-ocean-400">
                      <m.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-white">{m.label}</span>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    );
  }

  // Superadmin full analytics dashboard
  if (!data) return null;

  const stats = [
    { icon: Users, label: t.admin.stats.totalUsers, value: data.stats.totalUsers, color: 'text-blue-400 bg-blue-900/20' },
    { icon: ShoppingCart, label: t.admin.stats.totalOrders, value: data.stats.totalOrders, color: 'text-green-400 bg-green-900/20' },
    { icon: DollarSign, label: t.admin.stats.totalRevenue, value: formatPrice(data.stats.totalRevenue), color: 'text-emerald-400 bg-emerald-900/20' },
    { icon: Ticket, label: t.admin.stats.openTickets, value: data.stats.openTickets, color: 'text-orange-400 bg-orange-900/20' },
    { icon: Package, label: t.admin.stats.totalProducts, value: data.stats.totalProducts, color: 'text-purple-400 bg-purple-900/20' },
    { icon: Wrench, label: t.admin.stats.totalServices, value: data.stats.totalServices, color: 'text-indigo-400 bg-indigo-900/20' },
    { icon: GraduationCap, label: t.admin.stats.totalOpportunities, value: data.stats.totalOpportunities, color: 'text-pink-400 bg-pink-900/20' },
    { icon: AlertCircle, label: t.admin.stats.pendingApplications, value: data.stats.pendingApplications, color: 'text-amber-400 bg-amber-900/20' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t.admin.dashboard}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-dark-400">{s.label}</p>
                <p className="text-lg font-bold text-white">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-white mb-4">{t.admin.recentOrders}</h2>
          <div className="space-y-3">
            {data.recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{o.user?.firstName} {o.user?.lastName}</p>
                  <p className="text-xs text-dark-500">{formatDate(o.createdAt)}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-medium text-white">{formatPrice(o.total)}</p>
                  <Badge variant={o.status === 'COMPLETED' ? 'success' : 'warning'} className="text-[10px]">{t.orders.statusLabels[o.status as keyof typeof t.orders.statusLabels] || o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-white mb-4">{t.admin.recentTickets}</h2>
          <div className="space-y-3">
            {data.recentTickets.map((tk: any) => (
              <div key={tk.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{tk.subject}</p>
                  <p className="text-xs text-dark-500">{formatDate(tk.createdAt)}</p>
                </div>
                <Badge variant={tk.status === 'OPEN' ? 'warning' : 'info'} className="text-[10px]">{t.tickets.statusLabels[tk.status as keyof typeof t.tickets.statusLabels] || tk.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
