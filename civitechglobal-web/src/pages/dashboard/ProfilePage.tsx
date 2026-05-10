import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../config/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '' });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.put(`/users/${user!.id}`, form);
    },
    onSuccess: () => {
      refreshUser();
      toast(t.profile.updateSuccess, 'success');
    },
    onError: () => toast(t.profile.updateFailed, 'error'),
  });

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">{t.profile.title}</h1>
      <Card className="max-w-lg">
        <h3 className="font-semibold text-dark-900 dark:text-white mb-4">{t.profile.personalInfo}</h3>
        <div className="space-y-4">
          <Input label={t.profile.firstName} value={form.firstName} onChange={update('firstName')} />
          <Input label={t.profile.lastName} value={form.lastName} onChange={update('lastName')} />
          <Input label={t.profile.email} value={user?.email || ''} disabled />
          <Input label={t.profile.phone} value={form.phone} onChange={update('phone')} placeholder={t.profile.phonePlaceholder} />
          <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>{t.profile.saveChanges}</Button>
        </div>
      </Card>
    </div>
  );
}
