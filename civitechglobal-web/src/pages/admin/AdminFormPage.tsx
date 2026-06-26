import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import api from '../../config/api';
import type { AdminRole, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';

export default function AdminFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();
  const [copied, setCopied] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    adminRoleId: '',
  });

  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  const { data: rolesData } = useQuery({
    queryKey: ['roles-list'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminRole[]>>('/roles?limit=100');
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
      };
      if (form.adminRoleId) payload.adminRoleId = form.adminRoleId;
      const { data } = await api.post<ApiResponse<{ username: string; password: string }>>('/users/admin', payload);
      return data.data;
    },
    onSuccess: (data) => {
      setCredentials(data);
      toast(t.admin.adminForm.createSuccess, 'success');
    },
    onError: () => toast(t.admin.adminForm.createFailed, 'error'),
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const roleOptions = [
    { value: '', label: t.admin.adminForm.selectRole },
    ...(rolesData?.map((r) => ({ value: r.id, label: r.name })) || []),
  ];

  if (credentials) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-6">
          {t.admin.adminForm.generatedCredentials}
        </h1>

        <div className="space-y-4 bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div>
            <label className="block text-xs text-dark-500 mb-1">{t.admin.adminForm.username}</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-dark-900 px-3 py-2 rounded-lg text-ocean-400 text-sm font-mono">
                {credentials.username}
              </code>
              <button
                onClick={() => copyToClipboard(credentials.username, 'username')}
                className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              >
                {copied === 'username' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-dark-500 mb-1">{t.admin.adminForm.password}</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-dark-900 px-3 py-2 rounded-lg text-ocean-400 text-sm font-mono">
                {credentials.password}
              </code>
              <button
                onClick={() => copyToClipboard(credentials.password, 'password')}
                className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              >
                {copied === 'password' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-yellow-400 mt-4">{t.admin.adminForm.copyWarning}</p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => navigate('/admin/admins')}>{t.back}</Button>
          <Button variant="outline" onClick={() => { setCredentials(null); setForm({ email: '', firstName: '', lastName: '', adminRoleId: '' }); }}>
            {t.admin.addNew}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <button onClick={() => navigate('/admin/admins')} className="flex items-center gap-1 text-sm text-dark-500 hover:text-dark-300 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">
        {t.admin.adminForm.createTitle}
      </h1>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label={t.admin.adminForm.firstName} value={form.firstName} onChange={update('firstName')} required />
          <Input label={t.admin.adminForm.lastName} value={form.lastName} onChange={update('lastName')} required />
        </div>
        <Input label={t.admin.adminForm.email} type="email" value={form.email} onChange={update('email')} placeholder={t.admin.adminForm.emailPlaceholder} required />
        <Select label={t.admin.adminForm.role} value={form.adminRoleId} onChange={update('adminRoleId')} options={roleOptions} />

        <div className="flex gap-3">
          <Button type="submit" isLoading={mutation.isPending}>{t.create}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/admins')}>{t.cancel}</Button>
        </div>
      </form>
    </div>
  );
}
