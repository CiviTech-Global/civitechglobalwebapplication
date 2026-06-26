import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, ExternalLink, Mail, Globe } from 'lucide-react';
import api from '../../config/api';
import type { Product, ApiResponse } from '../../types';
import { NeonButton } from '../../components/ui/NeonButton';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { GlowCard } from '../../components/ui/GlowCard';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
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
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-ocean-400 transition-colors mb-8">
        <BackIcon className="w-4 h-4" /> {t.products.backToProducts}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-12">
        <div className="h-80 md:h-full bg-gradient-to-br from-ocean-900/30 to-purple-900/20 rounded-2xl flex items-center justify-center border border-dark-700/50">
          <span className="text-8xl font-bold text-ocean-500/30">{product.name.charAt(0)}</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            {product.category && <Badge variant="info">{product.category}</Badge>}
            {!product.isActive && <Badge variant="warning">{t.products.comingSoon}</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
          <p className="text-dark-400 mb-6 leading-relaxed">{product.description}</p>

          {product.features.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-white mb-3">{t.products.features}</h3>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-dark-300">
                    <Check className="w-4 h-4 text-ocean-400" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-8">
            {product.githubUrl && (
              <a href={product.githubUrl} target="_blank" rel="noopener noreferrer">
                <NeonButton variant="outline" size="lg" className="gap-2">
                  <ExternalLink className="w-5 h-5" /> {t.products.viewOnGithub}
                </NeonButton>
              </a>
            )}
            {product.landingPageUrl && (
              <a href={product.landingPageUrl} target="_blank" rel="noopener noreferrer">
                <NeonButton variant="ghost" size="lg" className="gap-2">
                  <Globe className="w-5 h-5" /> {t.products.viewLandingPage}
                </NeonButton>
              </a>
            )}
            <NeonButton variant="purple" size="lg" onClick={() => setShowDemoForm(!showDemoForm)} className="gap-2">
              <Mail className="w-5 h-5" /> {t.products.requestDemo}
            </NeonButton>
          </div>

          {showDemoForm && (
            <AnimatedSection>
              <GlowCard hover={false} glowColor="purple">
                <h3 className="text-lg font-semibold text-white mb-4">{t.products.requestDemo}</h3>
                <div className="space-y-4">
                  <Input
                    label={t.contact.email}
                    type="email"
                    value={demoForm.email || user?.email || ''}
                    onChange={(e) => setDemoForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder={t.contact.emailPlaceholder}
                    required
                  />
                  <Input
                    label={t.contact.subject}
                    value={demoForm.subject || `Demo Request: ${product.name}`}
                    onChange={(e) => setDemoForm((p) => ({ ...p, subject: e.target.value }))}
                  />
                  <TextArea
                    label={t.contact.message}
                    value={demoForm.message}
                    onChange={(e) => setDemoForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder={t.contact.messagePlaceholder}
                    required
                  />
                  <div className="flex gap-3">
                    <NeonButton onClick={() => demoMutation.mutate()} isLoading={demoMutation.isPending}>
                      {t.submit}
                    </NeonButton>
                    <NeonButton variant="ghost" onClick={() => setShowDemoForm(false)}>{t.cancel}</NeonButton>
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>
          )}
        </div>
      </motion.div>
    </div>
  );
}
