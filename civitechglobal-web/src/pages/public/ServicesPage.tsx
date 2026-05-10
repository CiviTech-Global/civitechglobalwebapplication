import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../config/api';
import type { Service, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { formatPrice } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

export default function ServicesPage() {
  const [page, setPage] = useState(1);
  const { t, isRtl } = useLocale();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const { data, isLoading } = useQuery({
    queryKey: ['services', page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Service[]>>(`/services?page=${page}&limit=9`);
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">{t.services.title}</h1>
        <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">{t.services.description}</p>
      </motion.div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={`/services/${service.slug}`}>
                  <Card hover className="h-full flex flex-col">
                    <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-dark-800 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-300 dark:text-primary-700">{service.name.charAt(0)}</span>
                    </div>
                    {service.category && <Badge variant="info" className="self-start mb-2">{service.category}</Badge>}
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400 flex-1 line-clamp-2 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {service.price ? `${formatPrice(service.price)}${t.services.perHour}` : t.services.contactUs}
                      </span>
                      <span className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1">
                        {t.services.learnMore} <ArrowIcon className="w-4 h-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
