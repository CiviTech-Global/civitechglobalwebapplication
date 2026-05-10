import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Trash2, Save } from 'lucide-react';
import api from '../../config/api';
import type { ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const roleVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  USER: 'default', ADMIN: 'info', SUPER_ADMIN: 'warning',
};

const ALL_PERMISSIONS = [
  { key: 'products', labelEn: 'Products', labelFa: 'محصولات' },
  { key: 'services', labelEn: 'Services', labelFa: 'خدمات' },
  { key: 'opportunities', labelEn: 'Opportunities', labelFa: 'فرصت‌ها' },
  { key: 'orders', labelEn: 'Orders', labelFa: 'سفارش‌ها' },
  { key: 'tickets', labelEn: 'Tickets', labelFa: 'تیکت‌ها' },
  { key: 'users', labelEn: 'Users', labelFa: 'کاربران' },
  { key: 'content', labelEn: 'Content', labelFa: 'محتوا' },
  { key: 'analytics', labelEn: 'Analytics', labelFa: 'تحلیل‌ها' },
];

export default function AdminUserDetail() {
  const { t, isRtl, locale } = useLocale();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const [localPerms, setLocalPerms] = useState<string[] | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => { const { data } = await api.get<ApiResponse<any>>(`/users/${id}`); return data.data; },
  });

  const updateRole = useMutation({
    mutationFn: async (role: string) => { await api.put(`/users/${id}/role`, { role }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-user', id] }); toast(t.admin.userManagement.changeRole, 'success'); },
    onError: () => toast(t.error, 'error'),
  });

  const updatePermissions = useMutation({
    mutationFn: async (permissions: string[]) => { await api.put(`/users/${id}/permissions`, { permissions }); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      setLocalPerms(null);
      toast(t.admin.permissions?.saveSuccess || 'Permissions saved', 'success');
    },
    onError: () => toast(t.error, 'error'),
  });

  const deleteUser = useMutation({
    mutationFn: async () => { await api.delete(`/users/${id}`); },
    onSuccess: () => { toast(t.admin.userManagement.deleteUser, 'success'); },
    onError: () => toast(t.error, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!user) return <div className="text-center py-8 text-dark-500">{t.noData}</div>;

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const effectivePerms = localPerms !== null ? localPerms : (user.permissions || []);
  const permsDirty = localPerms !== null && JSON.stringify(localPerms) !== JSON.stringify(user.permissions || []);

  return (
    <div>
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 mb-6">
        <BackArrow className="w-4 h-4" /> {t.admin.users}
      </Link>

      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-primary-700 dark:text-primary-400">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-900 dark:text-white">{user.firstName} {user.lastName}</h1>
            <p className="text-dark-500">{user.email}</p>
            <Badge variant={roleVariant[user.role]}>{t.admin.userManagement.roles[user.role as keyof typeof t.admin.userManagement.roles]}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-dark-500">{t.admin.userManagement.joinDate}</p><p className="text-dark-900 dark:text-white">{formatDate(user.createdAt)}</p></div>
          <div><p className="text-dark-500">{t.admin.orders}</p><p className="text-dark-900 dark:text-white">{user._count?.orders || 0}</p></div>
          <div><p className="text-dark-500">{t.admin.tickets}</p><p className="text-dark-900 dark:text-white">{user._count?.tickets || 0}</p></div>
          <div><p className="text-dark-500">{t.admin.applications}</p><p className="text-dark-900 dark:text-white">{user._count?.opportunityApplications || 0}</p></div>
        </div>
      </Card>

      {isSuperAdmin && user.role === 'ADMIN' && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark-900 dark:text-white">
              {t.admin.permissions?.title || 'Permissions'}
            </h2>
            {permsDirty && (
              <Button
                size="sm"
                onClick={() => updatePermissions.mutate(effectivePerms)}
                disabled={updatePermissions.isPending}
              >
                <Save className="w-4 h-4 me-2" />
                {t.save}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ALL_PERMISSIONS.map((perm) => {
              const checked = effectivePerms.includes(perm.key);
              return (
                <label
                  key={perm.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-700'
                      : 'border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 rounded border-dark-300 focus:ring-primary-500"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? effectivePerms.filter((p: string) => p !== perm.key)
                        : [...effectivePerms, perm.key];
                      setLocalPerms(next);
                    }}
                  />
                  <span className="text-sm text-dark-700 dark:text-dark-300">
                    {locale === 'fa' ? perm.labelFa : perm.labelEn}
                  </span>
                </label>
              );
            })}
          </div>
        </Card>
      )}

      {isSuperAdmin && user.id !== currentUser?.id && (
        <Card>
          <h2 className="font-semibold text-dark-900 dark:text-white mb-4">{t.admin.userManagement.title}</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-dark-500 me-2">{t.admin.userManagement.changeRole}:</span>
            {['USER', 'ADMIN', 'SUPER_ADMIN'].map((role) => (
              <Button key={role} size="sm" variant={user.role === role ? 'primary' : 'outline'} onClick={() => updateRole.mutate(role)}>
                {t.admin.userManagement.roles[role as keyof typeof t.admin.userManagement.roles]}
              </Button>
            ))}
          </div>
          <Button variant="danger" size="sm" className="gap-2" onClick={() => { if (confirm(t.confirmDelete)) deleteUser.mutate(); }}>
            <Trash2 className="w-4 h-4" /> {t.admin.userManagement.deleteUser}
          </Button>
        </Card>
      )}
    </div>
  );
}
