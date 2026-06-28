import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import api from '../../config/api';
import type { Order, ApiResponse } from '../../types';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate, formatPrice } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning', CONFIRMED: 'info', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'danger',
};

export default function AdminOrders() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Order[]>>(`/orders?page=${page}`); return data; },
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    { key: 'id', header: t.orders.orderId, render: (o: any) => <span className="font-mono text-xs">{o.id.slice(0, 8)}...</span> },
    { key: 'user', header: t.admin.userManagement.name, render: (o: any) => `${o.user?.firstName || ''} ${o.user?.lastName || ''}` },
    { key: 'total', header: t.orders.total, render: (o: any) => formatPrice(o.total) },
    { key: 'status', header: t.orders.status, render: (o: any) => <Badge variant={statusVariant[o.status]}>{t.orders.statusLabels[o.status as keyof typeof t.orders.statusLabels]}</Badge> },
    { key: 'createdAt', header: t.orders.date, render: (o: any) => formatDate(o.createdAt) },
    { key: 'actions', header: '', render: (o: any) => (
      <Link to={`/admin/orders/${o.id}`} className="text-brand-green-600 hover:text-brand-green-700"><Eye className="w-4 h-4" /></Link>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t.admin.orders}</h1>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
