import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Ticket, GraduationCap } from 'lucide-react';
import api from '../../config/api';
import { Card } from '../../components/ui/Card';
import { useLocale } from '../../hooks/useLocale';

export default function DashboardPage() {
  const { t } = useLocale();

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => { const { data } = await api.get('/orders/my?limit=5'); return data; },
  });

  const { data: tickets } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => { const { data } = await api.get('/tickets/my?limit=5'); return data; },
  });

  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => { const { data } = await api.get('/opportunities/user/applications'); return data; },
  });

  const stats = [
    { icon: ShoppingCart, label: t.dashboard.totalOrders, value: orders?.data?.length ?? 0, to: '/dashboard/orders', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
    { icon: Ticket, label: t.dashboard.openTickets, value: tickets?.data?.filter((t: any) => t.status === 'OPEN').length ?? 0, to: '/dashboard/tickets', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' },
    { icon: GraduationCap, label: t.dashboard.applications, value: applications?.data?.length ?? 0, to: '/dashboard/opportunities', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t.dashboard.overview}</h1>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link to={stat.to}>
              <Card hover>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">{stat.label}</p>
                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
