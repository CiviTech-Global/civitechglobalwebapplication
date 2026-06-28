import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import type { Order, ApiResponse } from '../../types';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate, formatPrice } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning', CONFIRMED: 'info', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'danger',
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { t } = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Order[]>>(`/orders/my?page=${page}&limit=10`);
      return data;
    },
  });

  const columns = [
    { key: 'id', header: t.orders.orderId, render: (o: Order) => <Link to={`/dashboard/orders/${o.id}`} className="text-brand-green-600 dark:text-brand-green-400 hover:underline">{o.id.slice(0, 8)}...</Link> },
    { key: 'createdAt', header: t.orders.date, render: (o: Order) => formatDate(o.createdAt) },
    { key: 'total', header: t.orders.total, render: (o: Order) => formatPrice(o.total) },
    { key: 'status', header: t.orders.status, render: (o: Order) => <Badge variant={statusVariants[o.status]}>{t.orders.statusLabels[o.status as keyof typeof t.orders.statusLabels]}</Badge> },
  ];

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t.dashboard.myOrders}</h1>
      <Table columns={columns} data={data?.data || []} emptyMessage={t.orders.noOrders} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
