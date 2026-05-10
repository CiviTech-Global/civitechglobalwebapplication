import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import api from '../../config/api';
import type { Ticket, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/TextArea';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default',
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, isRtl } = useLocale();
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [message, setMessage] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
      return data.data;
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      await api.post(`/tickets/${id}/messages`, { content: message });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
    onError: () => toast(t.sendMessageError, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!ticket) return <div className="text-center py-20 text-dark-500">{t.noData}</div>;

  return (
    <div>
      <Link to="/dashboard/tickets" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <BackIcon className="w-4 h-4" /> {t.tickets.backToTickets}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{ticket.subject}</h1>
        <Badge variant={statusVariants[ticket.status]}>{t.tickets.statusLabels[ticket.status as keyof typeof t.tickets.statusLabels]}</Badge>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold text-dark-900 dark:text-white mb-4">{t.tickets.messages}</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {ticket.messages?.map((msg: any) => (
            <div key={msg.id} className={`p-3 rounded-lg ${msg.isStaff ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-dark-50 dark:bg-dark-800'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-dark-500 dark:text-dark-400">
                  {msg.isStaff ? t.tickets.staff : (msg.userId === user?.id ? t.tickets.you : msg.user?.firstName)}
                </span>
                <span className="text-xs text-dark-400">{formatDate(msg.createdAt)}</span>
              </div>
              <p className="text-sm text-dark-700 dark:text-dark-300">{msg.content}</p>
            </div>
          ))}
        </div>

        {ticket.status !== 'CLOSED' && (
          <div className="mt-4 flex gap-2">
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.tickets.messagePlaceholder}
              className="flex-1"
            />
            <Button onClick={() => sendMessage.mutate()} disabled={!message.trim()} isLoading={sendMessage.isPending} className="self-end">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
