import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';
import { NeonButton } from '../../components/ui/NeonButton';
import { Input } from '../../components/ui/Input';
import logoSrc from '../../assets/logos/concept logo - no bg - white.png';

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
        <div className="relative rounded-2xl border border-border-default/50 bg-surface-200/90 backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          {/* Glow border effect */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-brand-green-500/20 via-transparent to-brand-amber-500/20 -z-10" />

          <div className="text-center mb-8">
            <img src={logoSrc} alt={t.brand} className="w-16 h-16 object-contain mx-auto mb-4 invert dark:invert-0 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
            <h1 className="text-2xl font-bold text-text-primary">{t.auth.welcomeBack}</h1>
            <p className="text-sm text-text-muted mt-1">{t.auth.signInTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t.auth.email}
              type="email"
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t.auth.password}
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <NeonButton type="submit" isLoading={loading} className="w-full">
              {t.auth.signIn}
            </NeonButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
