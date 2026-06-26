import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../config/api';
import type { Order, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatPrice } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning', CONFIRMED: 'info', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'danger',
};

const statusFlow = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

export default function AdminOrderDetail() {
  const { t, isRtl } = useLocale();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`); return data.data; },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => { await api.put(`/orders/${id}/status`, { status }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-order', id] }); toast(t.orders.updateStatus, 'success'); },
    onError: () => toast(t.admin.contentManagement.saveFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!order) return <div className="text-center py-8 text-dark-500">{t.noData}</div>;

  const currentIdx = statusFlow.indexOf(order.status);
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div>
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 mb-6">
        <BackArrow className="w-4 h-4" /> {t.orders.backToOrders}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t.orders.details}</h1>
        <Badge variant={statusVariant[order.status]}>{t.orders.statusLabels[order.status as keyof typeof t.orders.statusLabels]}</Badge>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-dark-500">{t.admin.userManagement.name}</p><p className="font-medium text-white">{order.user?.firstName} {order.user?.lastName}</p></div>
          <div><p className="text-dark-500">{t.orders.date}</p><p className="text-white">{formatDate(order.createdAt)}</p></div>
          <div><p className="text-dark-500">{t.orders.total}</p><p className="font-bold text-primary-600">{formatPrice(order.total)}</p></div>
          <div><p className="text-dark-500">{t.orders.items}</p><p className="text-white">{order.items?.length || 0}</p></div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-semibold text-white mb-4">{t.orders.items}</h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
              <div>
                <p className="font-medium text-white">{item.product?.name}</p>
                <p className="text-sm text-dark-500">{t.orders.quantity}: {item.quantity} x {formatPrice(item.price)}</p>
              </div>
              <p className="font-medium text-end">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </Card>

      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
        <Card>
          <h2 className="font-semibold text-white mb-4">{t.orders.updateStatus}</h2>
          <div className="flex gap-2">
            {currentIdx < statusFlow.length - 1 && (
              <Button onClick={() => updateStatus.mutate(statusFlow[currentIdx + 1])} isLoading={updateStatus.isPending}>
                {t.orders.statusLabels[statusFlow[currentIdx + 1] as keyof typeof t.orders.statusLabels]}
              </Button>
            )}
            <Button variant="danger" onClick={() => updateStatus.mutate('CANCELLED')} isLoading={updateStatus.isPending}>
              {t.orders.statusLabels.CANCELLED}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
