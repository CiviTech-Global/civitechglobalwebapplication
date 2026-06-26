import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Users, Shield } from 'lucide-react';
import api from '../../config/api';
import type { Service, ApiResponse } from '../../types';
import { GlowCard } from '../../components/ui/GlowCard';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { useLocale } from '../../hooks/useLocale';

export default function ServicesPage() {
  const { t, isRtl } = useLocale();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const { data, isLoading } = useQuery({
    queryKey: ['services-all'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Service[]>>('/services?page=1&limit=10');
      return data.data;
    },
  });

  const getServiceIcon = (serviceType?: string) => {
    switch (serviceType) {
      case 'FREELANCERS_CENTER': return Users;
      case 'INSURANCE_MARKETPLACE': return Shield;
      default: return Users;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.services.title}</h1>
        <p className="text-dark-400 max-w-2xl mx-auto">{t.services.description}</p>
      </AnimatedSection>

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {data?.map((service, i) => {
            const Icon = getServiceIcon(service.serviceType);
            return (
              <AnimatedSection key={service.id} delay={i * 0.15}>
                <Link to={`/services/${service.slug}`}>
                  <GlowCard className="h-full" glowColor={i === 0 ? 'ocean' : 'purple'}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-ocean-600/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-ocean-500/20">
                        <Icon className="w-7 h-7 text-ocean-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{service.name}</h3>
                        {service.category && <Badge variant="info" className="text-xs">{service.category}</Badge>}
                      </div>
                    </div>

                    <p className="text-dark-400 mb-6 leading-relaxed">{service.description}</p>

                    {service.features && service.features.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-dark-300 mb-3">{t.services.whatsIncluded}</h4>
                        <ul className="space-y-2">
                          {service.features.slice(0, 4).map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-dark-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-ocean-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <span className="text-sm text-ocean-400 flex items-center gap-1">
                      {t.services.learnMore} <ArrowIcon className="w-4 h-4" />
                    </span>
                  </GlowCard>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      )}
    </div>
  );
}
