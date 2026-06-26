import { useState } from 'react';
import { Navigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Save } from 'lucide-react';
import api from '../../config/api';
import type { User, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { useToast } from '../../components/ui/Toast';

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

export default function AdminPermissions() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Record<string, string[]>>({});

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-permissions-users'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>(`/users?role=ADMIN`);
      return data.data;
    },
  });

  const updatePermissions = useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: string[] }) => {
      await api.put(`/users/${id}/permissions`, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions-users'] });
      toast(t.admin.permissions?.saveSuccess || 'Permissions saved', 'success');
    },
    onError: () => {
      toast(t.error || 'An error occurred', 'error');
    },
  });

  if (isLoading) return <Spinner size="lg" />;

  const admins = data || [];

  const getPerms = (admin: User) => {
    return editing[admin.id] !== undefined ? editing[admin.id] : (admin.permissions || []);
  };

  const togglePerm = (adminId: string, perm: string) => {
    const current = getPerms({ id: adminId, permissions: editing[adminId] } as User);
    const next = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm];
    setEditing((prev) => ({ ...prev, [adminId]: next }));
  };

  const isDirty = (admin: User) => {
    const current = editing[admin.id];
    if (current === undefined) return false;
    const original = admin.permissions || [];
    return current.length !== original.length || current.some((p) => !original.includes(p));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-white">
          {t.admin.permissions?.title || 'Permissions'}
        </h1>
      </div>

      {admins.length === 0 ? (
        <Card>
          <p className="text-dark-500 text-center py-8">{t.noData}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {admins.map((admin) => (
            <Card key={admin.id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-white">
                    {admin.firstName} {admin.lastName}
                  </h2>
                  <p className="text-sm text-dark-500">{admin.email}</p>
                </div>
                {isDirty(admin) && (
                  <Button
                    size="sm"
                    onClick={() => updatePermissions.mutate({ id: admin.id, permissions: getPerms(admin) })}
                    disabled={updatePermissions.isPending}
                  >
                    <Save className="w-4 h-4 me-2" />
                    {t.save}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ALL_PERMISSIONS.map((perm) => {
                  const checked = getPerms(admin).includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'border-primary-700 bg-primary-900/20'
                          : 'border-dark-700 hover:bg-dark-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 rounded border-dark-300 focus:ring-primary-500"
                        checked={checked}
                        onChange={() => togglePerm(admin.id, perm.key)}
                      />
                      <span className="text-sm text-dark-300">
                        {locale === 'fa' ? perm.labelFa : perm.labelEn}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
