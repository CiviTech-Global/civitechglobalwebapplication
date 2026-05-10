import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast(t.auth.registerSuccess, 'success');
      const redirectTo = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast(err.response?.data?.message || t.auth.invalidCredentials, 'error');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">CT</span>
            </div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{t.auth.signUp}</h1>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{t.auth.signUpTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label={t.auth.firstName} value={form.firstName} onChange={update('firstName')} required />
              <Input label={t.auth.lastName} value={form.lastName} onChange={update('lastName')} required />
            </div>
            <Input label={t.auth.email} type="email" placeholder={t.auth.emailPlaceholder} value={form.email} onChange={update('email')} required />
            <Input label={t.auth.password} type="password" placeholder={t.auth.passwordPlaceholder} value={form.password} onChange={update('password')} required />
            <Button type="submit" isLoading={loading} className="w-full">{t.auth.signUp}</Button>
          </form>

          <p className="text-center text-sm text-dark-500 dark:text-dark-400 mt-6">
            {t.auth.hasAccount}{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">{t.auth.signIn}</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
