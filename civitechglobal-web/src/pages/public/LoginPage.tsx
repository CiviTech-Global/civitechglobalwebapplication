import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast(t.auth.loginSuccess, 'success');
      const redirectTo = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : (from || '/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast(err.response?.data?.message || t.auth.invalidCredentials, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">CT</span>
            </div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{t.auth.welcomeBack}</h1>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{t.auth.signInTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t.auth.email} type="email" placeholder={t.auth.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label={t.auth.password} type="password" placeholder={t.auth.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" isLoading={loading} className="w-full">{t.auth.signIn}</Button>
          </form>

          <p className="text-center text-sm text-dark-500 dark:text-dark-400 mt-6">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">{t.auth.signUp}</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
