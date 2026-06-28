import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import api from '../../config/api';
import type { User, ApiResponse } from '../../types';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const roleVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  USER: 'default', ADMIN: 'info', SUPER_ADMIN: 'warning',
};

export default function AdminUsers() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => { const { data } = await api.get<ApiResponse<User[]>>(`/users?page=${page}&search=${search}`); return data; },
  });

  if (isLoading) return <Spinner size="lg" />;

  const columns = [
    { key: 'name', header: t.admin.userManagement.name, render: (u: User) => <span className="font-medium">{u.firstName} {u.lastName}</span> },
    { key: 'email', header: t.admin.userManagement.email },
    { key: 'role', header: t.admin.userManagement.role, render: (u: User) => <Badge variant={roleVariant[u.role]}>{t.admin.userManagement.roles[u.role as keyof typeof t.admin.userManagement.roles]}</Badge> },
    { key: 'createdAt', header: t.admin.userManagement.joinDate, render: (u: User) => formatDate(u.createdAt) },
    { key: 'actions', header: '', render: (u: User) => (
      <Link to={`/admin/users/${u.id}`} className="text-brand-green-600 hover:text-brand-green-700"><Eye className="w-4 h-4" /></Link>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t.admin.users}</h1>
        <div className="w-64">
          <Input placeholder={t.search} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>
      <Table columns={columns} data={(data?.data || []) as any} />
      {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
