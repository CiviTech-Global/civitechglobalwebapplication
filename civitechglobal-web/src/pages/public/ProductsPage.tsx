import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../config/api';
import type { Product, ApiResponse } from '../../types';
import { GlowCard } from '../../components/ui/GlowCard';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { useLocale } from '../../hooks/useLocale';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { t, isRtl } = useLocale();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const { data, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product[]>>(`/products?page=${page}&limit=9`);
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.products.title}</h1>
        <p className="text-dark-400 max-w-2xl mx-auto">{t.products.description}</p>
      </AnimatedSection>

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((product, i) => (
              <AnimatedSection key={product.id} delay={i * 0.1}>
                <Link to={`/products/${product.slug}`}>
                  <GlowCard className="h-full flex flex-col" glowColor={i % 3 === 1 ? 'purple' : 'ocean'}>
                    <div className="h-48 bg-gradient-to-br from-ocean-900/30 to-purple-900/20 rounded-lg mb-4 flex items-center justify-center border border-dark-700/50">
                      <span className="text-4xl font-bold text-ocean-500/40">{product.name.charAt(0)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {product.category && <Badge variant="info" className="text-xs">{product.category}</Badge>}
                      {!product.isActive && <Badge variant="warning" className="text-xs">{t.products.comingSoon}</Badge>}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-sm text-dark-400 flex-1 line-clamp-2 mb-4">{product.description}</p>
                    <span className="text-sm text-ocean-400 flex items-center gap-1">
                      {t.products.learnMore} <ArrowIcon className="w-4 h-4" />
                    </span>
                  </GlowCard>
                </Link>
              </AnimatedSection>
            ))}
          </div>
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
