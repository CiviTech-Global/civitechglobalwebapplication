import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, ExternalLink, Mail } from 'lucide-react';
import api from '../../config/api';
import type { Product, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, isRtl } = useLocale();
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [demoForm, setDemoForm] = useState({ email: '', subject: '', message: '' });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product>>(`/products/${slug}`);
      return data.data;
    },
  });

  const demoMutation = useMutation({
    mutationFn: async () => {
      await api.post('/tickets', {
        subject: demoForm.subject || `Demo Request: ${product!.name}`,
        email: demoForm.email,
        message: demoForm.message,
        category: 'DEMO_REQUEST',
      });
    },
    onSuccess: () => {
      toast(t.products.demoRequestSuccess, 'success');
      setShowDemoForm(false);
      setDemoForm({ email: '', subject: '', message: '' });
    },
    onError: () => {
      toast(t.products.demoRequestFailed, 'error');
    },
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!product) return <div className="text-center py-20 text-dark-500">{t.products.notFound}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 mb-8">
        <BackIcon className="w-4 h-4" /> {t.products.backToProducts}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-12">
        <div className="h-80 md:h-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-dark-800 rounded-2xl flex items-center justify-center">
          <span className="text-8xl font-bold text-primary-300 dark:text-primary-700">{product.name.charAt(0)}</span>
        </div>

        <div>
          {product.category && <Badge variant="info" className="mb-3">{product.category}</Badge>}
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">{product.name}</h1>
          <p className="text-dark-500 dark:text-dark-400 mb-6">{product.description}</p>

          {product.features.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-dark-900 dark:text-white mb-3">{t.products.features}</h3>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                    <Check className="w-4 h-4 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            {product.githubUrl && (
              <a href={product.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  <ExternalLink className="w-5 h-5" /> {t.products.viewOnGithub}
                </Button>
              </a>
            )}
            <Button size="lg" onClick={() => setShowDemoForm(!showDemoForm)} className="gap-2">
              <Mail className="w-5 h-5" /> {t.products.requestDemo}
            </Button>
          </div>

          {showDemoForm && (
            <div className="bg-dark-50 dark:bg-dark-800/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">{t.products.requestDemo}</h3>
              <div className="space-y-4">
                <Input
                  label={t.support.email}
                  type="email"
                  value={demoForm.email || user?.email || ''}
                  onChange={(e) => setDemoForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder={t.support.emailPlaceholder}
                  required
                />
                <Input
                  label={t.support.subject}
                  value={demoForm.subject || `Demo Request: ${product.name}`}
                  onChange={(e) => setDemoForm((p) => ({ ...p, subject: e.target.value }))}
                />
                <TextArea
                  label={t.support.description_field}
                  value={demoForm.message}
                  onChange={(e) => setDemoForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder={t.support.descriptionPlaceholder}
                  required
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => demoMutation.mutate()}
                    isLoading={demoMutation.isPending}
                  >
                    {t.submit}
                  </Button>
                  <Button variant="outline" onClick={() => setShowDemoForm(false)}>{t.cancel}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
