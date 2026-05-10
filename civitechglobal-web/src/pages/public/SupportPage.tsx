import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../config/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    subject: '',
    description: '',
    priority: 'MEDIUM',
  });

  const priorityOptions = [
    { value: 'LOW', label: t.support.priorities.LOW },
    { value: 'MEDIUM', label: t.support.priorities.MEDIUM },
    { value: 'HIGH', label: t.support.priorities.HIGH },
    { value: 'URGENT', label: t.support.priorities.URGENT },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets', form);
      toast(t.support.submitSuccess, 'success');
      setForm({ name: '', email: '', subject: '', description: '', priority: 'MEDIUM' });
    } catch {
      toast(t.support.submitFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">{t.support.title}</h1>
        <p className="text-dark-500 dark:text-dark-400">{t.support.description}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label={t.support.name} value={form.name} onChange={update('name')} placeholder={t.support.namePlaceholder} required />
              <Input label={t.support.email} type="email" value={form.email} onChange={update('email')} placeholder={t.support.emailPlaceholder} required />
            </div>
            <Input label={t.support.subject} value={form.subject} onChange={update('subject')} placeholder={t.support.subjectPlaceholder} required />
            <TextArea label={t.support.description_field} value={form.description} onChange={update('description')} placeholder={t.support.descriptionPlaceholder} required />
            <Select label={t.support.priority} value={form.priority} onChange={update('priority')} options={priorityOptions} />
            <Button type="submit" isLoading={loading} className="w-full">{t.support.submitTicket}</Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
