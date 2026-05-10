import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FileText, Briefcase, GraduationCap } from 'lucide-react';
import api from '../../config/api';
import type { Opportunity, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';

export default function AdminOpportunities() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-opportunities', page],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Opportunity[]>>(`/opportunities/admin/all?page=${page}`); return data; },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/opportunities/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] }); toast(t.admin.opportunityForm.deleteSuccess, 'success'); },
    onError: () => toast(t.admin.opportunityForm.deleteFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    { key: 'title', header: t.admin.opportunityForm.title, render: (i: any) => <span className="font-medium">{i.title}</span> },
    { key: 'opportunityType', header: t.opportunities.opportunityType, render: (i: any) => (
      <Badge variant={i.opportunityType === 'JOB' ? 'info' : 'success'} className="gap-1">
        {i.opportunityType === 'JOB' ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
        {i.opportunityType === 'JOB' ? t.opportunities.job : t.opportunities.internship}
      </Badge>
    )},
    { key: 'duration', header: t.opportunities.duration },
    { key: 'isOpen', header: t.status, render: (i: any) => <Badge variant={i.isOpen ? 'success' : 'default'}>{i.isOpen ? t.opportunities.open : t.opportunities.closed}</Badge> },
    { key: '_count', header: t.admin.applications, render: (i: any) => i._count?.applications || 0 },
    { key: 'actions', header: '', className: 'w-24', render: (i: any) => (
      <div className="flex items-center gap-2">
        <Link to={`/admin/opportunities/${i.id}/edit`} className="text-primary-600 hover:text-primary-700"><Edit className="w-4 h-4" /></Link>
        <button onClick={() => { if (confirm(t.confirmDelete)) deleteMut.mutate(i.id); }} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{t.admin.opportunities}</h1>
        <div className="flex gap-2">
          <Link to="/admin/opportunities/applications"><Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> {t.admin.applications}</Button></Link>
          <Link to="/admin/opportunities/new"><Button className="gap-2"><Plus className="w-4 h-4" /> {t.admin.addNew}</Button></Link>
        </div>
      </div>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
