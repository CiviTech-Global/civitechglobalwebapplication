import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../config/api';
import type { Order, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate, formatPrice } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning', CONFIRMED: 'info', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'danger',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { t, isRtl } = useLocale();
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      return data.data;
    },
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!order) return <div className="text-center py-20 text-text-muted">{t.noData}</div>;

  return (
    <div>
      <Link to="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-green-600 dark:hover:text-brand-green-400 mb-6">
        <BackIcon className="w-4 h-4" /> {t.orders.backToOrders}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t.orders.details}</h1>
        <Badge variant={statusVariants[order.status]}>{t.orders.statusLabels[order.status as keyof typeof t.orders.statusLabels]}</Badge>
      </div>

      <Card className="mb-6">
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div><span className="text-text-muted">{t.orders.orderId}:</span> <span className="font-medium text-text-primary">{order.id.slice(0, 12)}...</span></div>
          <div><span className="text-text-muted">{t.orders.date}:</span> <span className="font-medium text-text-primary">{formatDate(order.createdAt)}</span></div>
          <div><span className="text-text-muted">{t.orders.total}:</span> <span className="font-bold text-brand-green-600 dark:text-brand-green-400">{formatPrice(order.total)}</span></div>
        </div>
      </Card>

      {order.items && order.items.length > 0 && (
        <Card>
          <h3 className="font-semibold text-text-primary mb-4">{t.orders.items}</h3>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                <div>
                  <p className="font-medium text-text-primary">{item.product?.name || t.orders.product}</p>
                  <p className="text-sm text-text-muted">{t.orders.quantity}: {item.quantity}</p>
                </div>
                <span className="font-medium text-text-primary">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
