import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import api from '../../config/api';
import type { Lead, ApiResponse } from '../../types';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  NEW: 'warning',
  CONTACTED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function AdminLeads() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Lead[]>>(`/leads?page=${page}`);
      return data;
    },
  });

  if (isLoading) return <Spinner size="lg" />;

  const statusLabels = t.leads.statusLabels as Record<string, string>;

  const columns = [
    { key: 'id', header: 'ID', render: (l: Lead) => <span className="font-mono text-xs">{l.id.slice(0, 8)}...</span> },
    { key: 'fullName', header: t.leads.fullName, render: (l: Lead) => l.fullName },
    { key: 'phoneNumber', header: t.leads.phoneNumber, render: (l: Lead) => l.phoneNumber },
    { key: 'category', header: t.leads.category, render: (l: Lead) => `${l.category?.emoji ? `${l.category.emoji} ` : ''}${l.category?.title || ''}` },
    { key: 'subcategory', header: t.leads.subcategory, render: (l: Lead) => l.subcategory?.title || '' },
    { key: 'city', header: t.leads.city, render: (l: Lead) => l.city },
    { key: 'status', header: t.status, render: (l: Lead) => <Badge variant={statusVariant[l.status]}>{statusLabels[l.status]}</Badge> },
    { key: 'createdAt', header: t.orders.date, render: (l: Lead) => formatDate(l.createdAt) },
    { key: 'actions', header: '', render: (l: Lead) => (
      <Link to={`/admin/leads/${l.id}`} className="text-brand-green-600 hover:text-brand-green-700"><Eye className="w-4 h-4" /></Link>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t.leads.title}</h1>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
