import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../config/api';
import type { Service, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { formatPrice } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

export default function AdminServices() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-services', page],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Service[]>>(`/services?page=${page}`); return data; },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/services/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); toast(t.admin.serviceForm.deleteSuccess, 'success'); },
    onError: () => toast(t.admin.serviceForm.deleteFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    { key: 'name', header: t.admin.name, render: (s: Service) => <span className="font-medium">{s.name}</span> },
    { key: 'category', header: t.admin.category, render: (s: Service) => s.category ? <Badge variant="info">{s.category}</Badge> : '-' },
    { key: 'price', header: t.orders.price, render: (s: Service) => s.price ? `${formatPrice(s.price)}${t.services.perHour}` : t.notAvailable },
    { key: 'isActive', header: t.status, render: (s: Service) => <Badge variant={s.isActive ? 'success' : 'default'}>{s.isActive ? t.admin.active : t.admin.inactive}</Badge> },
    { key: 'actions', header: '', className: 'w-24', render: (s: Service) => (
      <div className="flex items-center gap-2">
        <Link to={`/admin/services/${s.id}/edit`} className="text-brand-green-600 hover:text-brand-green-700"><Edit className="w-4 h-4" /></Link>
        <button onClick={() => { if (confirm(t.confirmDelete)) deleteMut.mutate(s.id); }} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t.admin.services}</h1>
        <Link to="/admin/services/new"><Button className="gap-2"><Plus className="w-4 h-4" /> {t.admin.addNew}</Button></Link>
      </div>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
