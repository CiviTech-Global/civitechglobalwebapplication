import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import type { Ticket, ApiResponse } from '../../types';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default',
};

const priorityVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  LOW: 'default', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger',
};

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const { t } = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets', page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Ticket[]>>(`/tickets/my?page=${page}&limit=10`);
      return data;
    },
  });

  const columns = [
    { key: 'subject', header: t.tickets.subject, render: (ticket: Ticket) => <Link to={`/dashboard/tickets/${ticket.id}`} className="text-brand-green-600 dark:text-brand-green-400 hover:underline">{ticket.subject}</Link> },
    { key: 'status', header: t.tickets.status, render: (ticket: Ticket) => <Badge variant={statusVariants[ticket.status]}>{t.tickets.statusLabels[ticket.status as keyof typeof t.tickets.statusLabels]}</Badge> },
    { key: 'priority', header: t.tickets.priority, render: (ticket: Ticket) => <Badge variant={priorityVariants[ticket.priority]}>{t.tickets.priorityLabels[ticket.priority as keyof typeof t.tickets.priorityLabels]}</Badge> },
    { key: 'createdAt', header: t.tickets.date, render: (ticket: Ticket) => formatDate(ticket.createdAt) },
  ];

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t.dashboard.myTickets}</h1>
      <Table columns={columns} data={data?.data || []} emptyMessage={t.tickets.noTickets} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
