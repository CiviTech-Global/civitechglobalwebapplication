import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import api from '../../config/api';
import type { Service, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { t, isRtl } = useLocale();
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Service>>(`/services/${slug}`);
      return data.data;
    },
  });

  if (isLoading) return <Spinner size="lg" />;
  if (!service) return <div className="text-center py-20 text-text-muted">{t.services.notFound}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-green-600 dark:hover:text-brand-green-400 mb-8">
        <BackIcon className="w-4 h-4" /> {t.services.backToServices}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-12">
        <div className="h-80 md:h-full bg-gradient-to-br from-brand-green-50 to-surface-50 dark:from-brand-green-900/20 dark:to-surface-800 rounded-2xl flex items-center justify-center">
          <span className="text-8xl font-bold text-brand-green-300 dark:text-brand-green-700">{service.name.charAt(0)}</span>
        </div>

        <div>
          {service.category && <Badge variant="info" className="mb-3">{service.category}</Badge>}
          <h1 className="text-3xl font-bold text-text-primary mb-4">{service.name}</h1>
          <p className="text-text-muted mb-6">{service.description}</p>

          {service.features.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-text-primary mb-3">{t.services.whatsIncluded}</h3>
              <ul className="space-y-2">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-brand-green-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-4">
            {service.price && (
              <span className="text-3xl font-bold text-brand-green-600 dark:text-brand-green-400">{formatPrice(service.price)}{t.services.perHour}</span>
            )}
            <Link to="/support">
              <Button size="lg">{t.services.getInTouch}</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
