import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import api from '../../config/api';
import type { Ticket, ApiResponse } from '../../types';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default',
};

const priorityVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  LOW: 'default', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger',
};

export default function AdminTickets() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', page],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Ticket[]>>(`/tickets?page=${page}`); return data; },
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    { key: 'subject', header: t.tickets.subject, render: (tk: any) => <span className="font-medium">{tk.subject}</span> },
    { key: 'user', header: t.admin.userManagement.name, render: (tk: any) => tk.user ? `${tk.user.firstName} ${tk.user.lastName}` : tk.email },
    { key: 'status', header: t.tickets.status, render: (tk: any) => <Badge variant={statusVariant[tk.status]}>{t.tickets.statusLabels[tk.status as keyof typeof t.tickets.statusLabels]}</Badge> },
    { key: 'priority', header: t.tickets.priority, render: (tk: any) => <Badge variant={priorityVariant[tk.priority]}>{t.tickets.priorityLabels[tk.priority as keyof typeof t.tickets.priorityLabels]}</Badge> },
    { key: 'messages', header: t.tickets.messages, render: (tk: any) => tk._count?.messages || 0 },
    { key: 'createdAt', header: t.tickets.date, render: (tk: any) => formatDate(tk.createdAt) },
    { key: 'actions', header: '', render: (tk: any) => (
      <Link to={`/admin/tickets/${tk.id}`} className="text-primary-600 hover:text-primary-700"><Eye className="w-4 h-4" /></Link>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t.admin.tickets}</h1>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
