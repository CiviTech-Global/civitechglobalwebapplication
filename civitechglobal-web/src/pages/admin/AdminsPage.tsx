import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, Shield } from 'lucide-react';
import api from '../../config/api';
import type { User, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { useLocale } from '../../hooks/useLocale';
import { formatDate } from '../../lib/utils';

export default function AdminsPage() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-admins', page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>(`/users?page=${page}&role=ADMIN,SUPER_ADMIN`);
      return data;
    },
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    {
      key: 'name',
      header: t.admin.userManagement.name,
      render: (u: User) => (
        <div>
          <span className="font-medium">{u.firstName} {u.lastName}</span>
          {u.username && <span className="block text-xs text-dark-500">@{u.username}</span>}
        </div>
      ),
    },
    { key: 'email', header: t.admin.userManagement.email, render: (u: User) => u.email },
    {
      key: 'role',
      header: t.admin.userManagement.role,
      render: (u: User) => (
        <Badge variant={u.role === 'SUPER_ADMIN' ? 'warning' : 'info'}>
          {t.admin.userManagement.roles[u.role]}
        </Badge>
      ),
    },
    {
      key: 'adminRole',
      header: t.admin.roles,
      render: (u: User) => u.adminRole ? (
        <span className="flex items-center gap-1 text-sm">
          <Shield className="w-3 h-3 text-purple-400" /> {u.adminRole.name}
        </span>
      ) : '-',
    },
    {
      key: 'date',
      header: t.admin.userManagement.joinDate,
      render: (u: User) => formatDate(u.createdAt),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t.admin.admins}</h1>
        <Link to="/admin/admins/new">
          <Button className="gap-2"><Plus className="w-4 h-4" /> {t.admin.addNew}</Button>
        </Link>
      </div>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
