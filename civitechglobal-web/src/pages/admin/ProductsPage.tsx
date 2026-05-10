import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../config/api';
import type { Product, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { formatPrice } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

export default function AdminProducts() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Product[]>>(`/products?page=${page}`); return data; },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/products/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast(t.admin.productForm.deleteSuccess, 'success'); },
    onError: () => toast(t.admin.productForm.deleteFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    { key: 'name', header: t.admin.name, render: (p: Product) => <span className="font-medium">{p.name}</span> },
    { key: 'category', header: t.admin.category, render: (p: Product) => p.category ? <Badge variant="info">{p.category}</Badge> : '-' },
    { key: 'price', header: t.orders.price, render: (p: Product) => p.price != null ? formatPrice(p.price) : '-' },
    { key: 'isActive', header: t.status, render: (p: Product) => <Badge variant={p.isActive ? 'success' : 'default'}>{p.isActive ? t.admin.active : t.admin.inactive}</Badge> },
    { key: 'actions', header: '', className: 'w-24', render: (p: Product) => (
      <div className="flex items-center gap-2">
        <Link to={`/admin/products/${p.id}/edit`} className="text-primary-600 hover:text-primary-700"><Edit className="w-4 h-4" /></Link>
        <button onClick={() => { if (confirm(t.confirmDelete)) deleteMut.mutate(p.id); }} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{t.admin.products}</h1>
        <Link to="/admin/products/new"><Button className="gap-2"><Plus className="w-4 h-4" /> {t.admin.addNew}</Button></Link>
      </div>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
