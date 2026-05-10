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
  if (!service) return <div className="text-center py-20 text-dark-500">{t.services.notFound}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 mb-8">
        <BackIcon className="w-4 h-4" /> {t.services.backToServices}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-12">
        <div className="h-80 md:h-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-dark-800 rounded-2xl flex items-center justify-center">
          <span className="text-8xl font-bold text-primary-300 dark:text-primary-700">{service.name.charAt(0)}</span>
        </div>

        <div>
          {service.category && <Badge variant="info" className="mb-3">{service.category}</Badge>}
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">{service.name}</h1>
          <p className="text-dark-500 dark:text-dark-400 mb-6">{service.description}</p>

          {service.features.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-dark-900 dark:text-white mb-3">{t.services.whatsIncluded}</h3>
              <ul className="space-y-2">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                    <Check className="w-4 h-4 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-4">
            {service.price && (
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatPrice(service.price)}{t.services.perHour}</span>
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
