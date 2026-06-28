import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import api from '../../config/api';
import type { AdminRole, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';

export default function RolesPage() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-roles', page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminRole[]>>(`/roles?page=${page}`);
      return data;
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/roles/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast(t.admin.roleForm.deleteSuccess, 'success');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t.admin.roleForm.deleteFailed;
      toast(msg, 'error');
    },
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    {
      key: 'name',
      header: t.admin.name,
      render: (r: AdminRole) => (
        <span className="flex items-center gap-2 font-medium">
          <Shield className="w-4 h-4 text-brand-amber-500" /> {r.name}
        </span>
      ),
    },
    {
      key: 'permissions',
      header: t.admin.roleForm.permissions,
      render: (r: AdminRole) => (
        <div className="flex flex-wrap gap-1">
          {r.permissions.slice(0, 4).map((p) => (
            <Badge key={p} variant="info" className="text-xs">{p}</Badge>
          ))}
          {r.permissions.length > 4 && (
            <Badge variant="default" className="text-xs">+{r.permissions.length - 4}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'users',
      header: t.admin.roleForm.usersAssigned,
      render: (r: AdminRole) => (
        <Badge variant="default">{r._count?.users ?? 0}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r: AdminRole) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/roles/${r.id}/edit`} className="text-brand-green-600 hover:text-brand-green-700">
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              if (r._count?.users && r._count.users > 0) {
                toast(t.admin.roleForm.cannotDeleteWithUsers, 'error');
                return;
              }
              if (confirm(t.confirmDelete)) deleteMut.mutate(r.id);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t.admin.roles}</h1>
        <Link to="/admin/roles/new">
          <Button className="gap-2"><Plus className="w-4 h-4" /> {t.admin.addNew}</Button>
        </Link>
      </div>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
