import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../config/api';
import type { OpportunityApplication, ApiResponse } from '../../types';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning', REVIEWING: 'info', ACCEPTED: 'success', REJECTED: 'danger',
};

export default function ApplicationsPage() {
  const { t, isRtl } = useLocale();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', page],
    queryFn: async () => { const { data } = await api.get<ApiResponse<OpportunityApplication[]>>(`/opportunities/admin/applications?page=${page}`); return data; },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/opportunities/admin/applications/${id}`, { status });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-applications'] }); toast(t.admin.opportunityForm.saveSuccess, 'success'); },
    onError: () => toast(t.admin.opportunityForm.saveFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    { key: 'user', header: t.admin.userManagement.name, render: (a: any) => <span className="font-medium">{a.user?.firstName} {a.user?.lastName}</span> },
    { key: 'opportunity', header: t.admin.opportunities, render: (a: any) => a.opportunity?.title || '-' },
    { key: 'status', header: t.status, render: (a: any) => <Badge variant={statusVariant[a.status]}>{t.admin.applicationStatus[a.status as keyof typeof t.admin.applicationStatus] || a.status}</Badge> },
    { key: 'createdAt', header: t.orders.date, render: (a: any) => formatDate(a.createdAt) },
    { key: 'actions', header: t.actions, render: (a: any) => (
      <div className="flex items-center gap-1">
        {a.status === 'PENDING' && (
          <>
            <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: a.id, status: 'REVIEWING' })}>{t.admin.applicationStatus.REVIEWING}</Button>
            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateStatus.mutate({ id: a.id, status: 'ACCEPTED' })}>{t.admin.applicationStatus.ACCEPTED}</Button>
            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateStatus.mutate({ id: a.id, status: 'REJECTED' })}>{t.admin.applicationStatus.REJECTED}</Button>
          </>
        )}
        {a.status === 'REVIEWING' && (
          <>
            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateStatus.mutate({ id: a.id, status: 'ACCEPTED' })}>{t.admin.applicationStatus.ACCEPTED}</Button>
            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateStatus.mutate({ id: a.id, status: 'REJECTED' })}>{t.admin.applicationStatus.REJECTED}</Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <Link to="/admin/opportunities" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 mb-6">
        <BackArrow className="w-4 h-4" /> {t.opportunities.backToOpportunities}
      </Link>
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">{t.admin.applications}</h1>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
