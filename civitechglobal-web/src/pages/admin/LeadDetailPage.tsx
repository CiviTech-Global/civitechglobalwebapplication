import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../config/api';
import type { Lead, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  NEW: 'warning',
  CONTACTED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const LEAD_STATUSES: Lead['status'][] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AdminLeadDetail() {
  const { t, isRtl } = useLocale();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['admin-lead', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
      return data.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: Lead['status']) => {
      await api.put(`/leads/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lead', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      toast(t.leads.updateStatus, 'success');
    },
    onError: () => toast(t.admin.contentManagement.saveFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!lead) return <div className="text-center py-8 text-text-muted">{t.noData}</div>;

  const statusLabels = t.leads.statusLabels as Record<string, string>;
  const contactTimeLabels = t.leads.contactTimeLabels as Record<string, string>;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const statusOptions = LEAD_STATUSES.map((status) => ({
    value: status,
    label: statusLabels[status],
  }));

  return (
    <div>
      <Link to="/admin/leads" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-green-600 mb-6">
        <BackArrow className="w-4 h-4" /> {t.leads.backToLeads}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t.leads.details}</h1>
        <Badge variant={statusVariant[lead.status]}>{statusLabels[lead.status]}</Badge>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-muted">{t.leads.fullName}</p>
            <p className="font-medium text-text-primary">{lead.fullName}</p>
          </div>
          <div>
            <p className="text-text-muted">{t.leads.phoneNumber}</p>
            <p className="font-medium text-text-primary">{lead.phoneNumber}</p>
          </div>
          <div>
            <p className="text-text-muted">{t.leads.city}</p>
            <p className="font-medium text-text-primary">{lead.city}</p>
          </div>
          <div>
            <p className="text-text-muted">{t.leads.preferredContactTime}</p>
            <p className="font-medium text-text-primary">{contactTimeLabels[lead.preferredContactTime] || lead.preferredContactTime}</p>
          </div>
          <div>
            <p className="text-text-muted">{t.leads.category}</p>
            <p className="font-medium text-text-primary">{lead.category?.emoji ? `${lead.category.emoji} ` : ''}{lead.category?.title}</p>
          </div>
          <div>
            <p className="text-text-muted">{t.leads.subcategory}</p>
            <p className="font-medium text-text-primary">{lead.subcategory?.title}</p>
          </div>
          <div>
            <p className="text-text-muted">{t.leads.telegramUser}</p>
            <p className="font-medium text-text-primary">
              {lead.telegramFirstName || ''} {lead.telegramUsername ? `(@${lead.telegramUsername})` : ''}
            </p>
          </div>
          <div>
            <p className="text-text-muted">{t.orders.date}</p>
            <p className="font-medium text-text-primary">{formatDate(lead.createdAt)}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-text-muted">{t.leads.notes}</p>
          <p className="text-text-primary">{lead.notes || t.leads.noNotes}</p>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-text-primary mb-4">{t.leads.updateStatus}</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={lead.status}
            onChange={(e) => updateStatus.mutate(e.target.value as Lead['status'])}
            options={statusOptions}
            className="sm:w-64"
          />
          <Button onClick={() => updateStatus.mutate(lead.status)} isLoading={updateStatus.isPending} disabled={updateStatus.isPending}>
            {t.save}
          </Button>
        </div>
      </Card>
    </div>
  );
}
