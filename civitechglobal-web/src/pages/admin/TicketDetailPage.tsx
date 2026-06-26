import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import api from '../../config/api';
import type { Ticket, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/TextArea';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default',
};

export default function AdminTicketDetail() {
  const { t, isRtl } = useLocale();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['admin-ticket', id],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`); return data.data; },
  });

  const sendMessage = useMutation({
    mutationFn: async () => { await api.post(`/tickets/${id}/messages`, { content: message }); },
    onSuccess: () => { setMessage(''); queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] }); toast(t.tickets.send, 'success'); },
    onError: () => toast(t.admin.contentManagement.saveFailed, 'error'),
  });

  const updateStatus = useMutation({
    mutationFn: async (data: Record<string, string>) => { await api.put(`/tickets/${id}/status`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] }); toast(t.tickets.updateStatus, 'success'); },
    onError: () => toast(t.admin.contentManagement.saveFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!ticket) return <div className="text-center py-8 text-dark-500">{t.noData}</div>;

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div>
      <Link to="/admin/tickets" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 mb-6">
        <BackArrow className="w-4 h-4" /> {t.tickets.backToTickets}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{ticket.subject}</h1>
        <div className="flex gap-2">
          <Badge variant={statusVariant[ticket.status]}>{t.tickets.statusLabels[ticket.status as keyof typeof t.tickets.statusLabels]}</Badge>
          <Badge>{t.tickets.priorityLabels[ticket.priority as keyof typeof t.tickets.priorityLabels]}</Badge>
        </div>
      </div>

      {/* Status controls */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-dark-500 me-2">{t.tickets.updateStatus}:</span>
          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
            <Button key={s} size="sm" variant={ticket.status === s ? 'primary' : 'outline'} onClick={() => updateStatus.mutate({ status: s })}>
              {t.tickets.statusLabels[s as keyof typeof t.tickets.statusLabels]}
            </Button>
          ))}
          <span className="text-sm text-dark-500 ms-4 me-2">{t.tickets.priority}:</span>
          {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
            <Button key={p} size="sm" variant={ticket.priority === p ? 'primary' : 'outline'} onClick={() => updateStatus.mutate({ priority: p })}>
              {t.tickets.priorityLabels[p as keyof typeof t.tickets.priorityLabels]}
            </Button>
          ))}
        </div>
      </Card>

      {/* Messages */}
      <Card className="mb-6">
        <h2 className="font-semibold text-white mb-4">{t.tickets.messages}</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {ticket.messages?.map((msg) => (
            <div key={msg.id} className={`p-3 rounded-lg ${msg.isStaff ? 'bg-primary-900/20 ms-8' : 'bg-dark-800 me-8'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-dark-300">
                  {msg.user ? `${msg.user.firstName} ${msg.user.lastName}` : t.admin.guest}
                </span>
                {msg.isStaff && <Badge variant="info" className="text-[10px]">{t.tickets.staff}</Badge>}
                <span className="text-[10px] text-dark-400">{formatDate(msg.createdAt)}</span>
              </div>
              <p className="text-sm text-dark-300">{msg.content}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Reply */}
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage.mutate(); }} className="flex gap-3">
          <div className="flex-1">
            <TextArea placeholder={t.tickets.messagePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button type="submit" isLoading={sendMessage.isPending} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
