import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Trash2, Download, Users, Package, ShoppingCart, Ticket, GraduationCap, Wrench } from 'lucide-react';
import api from '../../config/api';
import type { ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';

interface DemoStatus {
  demoUsers: number;
  demoProducts: number;
  demoOrders: number;
  demoTickets: number;
  demoOpportunities: number;
  demoServices: number;
}

export default function DemoDataPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['demo-data-status'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DemoStatus>>('/admin/demo-data/status');
      return data.data;
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/admin/demo-data/seed');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-data-status'] });
      toast(t.admin.demoData.seedSuccess, 'success');
    },
    onError: () => toast(t.admin.demoData.seedFailed, 'error'),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/admin/demo-data/clear');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-data-status'] });
      toast(t.admin.demoData.clearSuccess, 'success');
    },
    onError: () => toast(t.admin.demoData.clearFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;

  const totalDemo = status
    ? status.demoUsers + status.demoProducts + status.demoOrders + status.demoTickets + status.demoOpportunities + status.demoServices
    : 0;

  const hasData = totalDemo > 0;

  const statCards = status ? [
    { icon: Users, label: t.admin.demoData.demoUsers, value: status.demoUsers, color: 'text-blue-400 bg-blue-900/20' },
    { icon: Package, label: t.admin.demoData.demoProducts, value: status.demoProducts, color: 'text-purple-400 bg-purple-900/20' },
    { icon: Wrench, label: t.admin.demoData.demoServices, value: status.demoServices, color: 'text-indigo-400 bg-indigo-900/20' },
    { icon: ShoppingCart, label: t.admin.demoData.demoOrders, value: status.demoOrders, color: 'text-green-400 bg-green-900/20' },
    { icon: Ticket, label: t.admin.demoData.demoTickets, value: status.demoTickets, color: 'text-orange-400 bg-orange-900/20' },
    { icon: GraduationCap, label: t.admin.demoData.demoOpportunities, value: status.demoOpportunities, color: 'text-pink-400 bg-pink-900/20' },
  ] : [];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">{t.admin.demoData.title}</h1>
      <p className="text-dark-400 text-sm mb-8">{t.admin.demoData.description}</p>

      {/* Status Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">{t.admin.demoData.status}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((s) => (
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

        <div className="mt-4">
          <Card className={hasData ? 'border-ocean-500/30' : 'border-dark-700/50'}>
            <div className="flex items-center gap-3">
              <Database className={`w-5 h-5 ${hasData ? 'text-ocean-400' : 'text-dark-500'}`} />
              <span className={hasData ? 'text-ocean-300' : 'text-dark-500'}>
                {hasData ? t.admin.demoData.hasData : t.admin.demoData.noData}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => seedMutation.mutate()}
          isLoading={seedMutation.isPending}
          disabled={seedMutation.isPending || clearMutation.isPending}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {seedMutation.isPending ? t.admin.demoData.seeding : t.admin.demoData.seed}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            if (confirm(t.admin.demoData.clearConfirm)) {
              clearMutation.mutate();
            }
          }}
          isLoading={clearMutation.isPending}
          disabled={seedMutation.isPending || clearMutation.isPending || !hasData}
          className="gap-2 border-red-500/30 text-red-400 hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          {clearMutation.isPending ? t.admin.demoData.clearing : t.admin.demoData.clear}
        </Button>
      </div>
    </div>
  );
}
