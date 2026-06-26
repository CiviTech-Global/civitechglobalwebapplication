import { Suspense, lazy } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Sparkles, Briefcase, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import type { Product, Service, ApiResponse } from '../../types';
import { GlowCard } from '../../components/ui/GlowCard';
import { NeonButton } from '../../components/ui/NeonButton';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { TypewriterText } from '../../components/ui/TypewriterText';
import { Badge } from '../../components/ui/Badge';
import { useLocale } from '../../hooks/useLocale';
import { toPersianDigits } from '../../lib/utils';

const DigitalGlobe = lazy(() => import('../../components/three/DigitalGlobe').then(m => ({ default: m.DigitalGlobe })));

export default function HomePage() {
  const { t, isRtl } = useLocale();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const { data: productsData } = useQuery({
    queryKey: ['products-preview'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product[]>>('/products?page=1&limit=7');
      return data.data;
    },
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services-preview'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Service[]>>('/services?page=1&limit=4');
      return data.data;
    },
  });

  const stats = [
    { value: isRtl ? toPersianDigits('50+') : '50+', label: t.home.stats.projects },
    { value: isRtl ? toPersianDigits('100+') : '100+', label: t.home.stats.clients },
    { value: isRtl ? toPersianDigits('25+') : '25+', label: t.home.stats.team },
    { value: isRtl ? toPersianDigits('15+') : '15+', label: t.home.stats.countries },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-ocean-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 end-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium text-ocean-400 bg-ocean-900/20 rounded-full border border-ocean-500/20">
              <Sparkles className="w-4 h-4" />
              {t.home.badge}
            </span>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              <TypewriterText text={t.home.heroTitle} speed={50} />
              <br />
              <span className="gradient-text">
                {t.home.heroTitleHighlight}
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-lg md:text-xl text-dark-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.home.heroDescription}
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <NeonButton size="lg" className="gap-2">
                  {t.home.exploreProducts} <ArrowIcon className="w-5 h-5" />
                </NeonButton>
              </Link>
              <Link to="/services">
                <NeonButton variant="outline" size="lg">
                  {t.home.viewServices}
                </NeonButton>
              </Link>
            </div>
          </AnimatedSection>

          {/* Three.js Digital Globe */}
          <AnimatedSection delay={0.4}>
            <div className="mt-16 mx-auto w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem]">
              <Suspense fallback={
                <div className="w-full h-full rounded-full border border-ocean-500/20 bg-gradient-to-br from-ocean-900/20 to-purple-900/20 flex items-center justify-center">
                  <span className="text-5xl font-bold gradient-text">CT</span>
                </div>
              }>
                <DigitalGlobe />
              </Suspense>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ocean-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-dark-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* About Snippet / What We Do */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.home.whatWeDo}</h2>
            <p className="text-dark-400 max-w-2xl mx-auto">{t.home.whatWeDoDesc}</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(t.home.features)
              .filter(([key]) => !key.endsWith('Desc'))
              .map(([key, title], i) => (
                <AnimatedSection key={key} delay={i * 0.1}>
                  <GlowCard className="h-full">
                    <div className="w-12 h-12 bg-ocean-900/30 rounded-lg flex items-center justify-center mb-4 border border-ocean-500/20">
                      <Sparkles className="w-6 h-6 text-ocean-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{title as string}</h3>
                    <p className="text-dark-400 text-sm">
                      {(t.home.features as Record<string, string>)[`${key}Desc`]}
                    </p>
                  </GlowCard>
                </AnimatedSection>
              ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.home.ourProducts}</h2>
            <p className="text-dark-400 max-w-2xl mx-auto">{t.home.ourProductsDesc}</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsData?.map((product, i) => (
              <AnimatedSection key={product.id} delay={i * 0.08}>
                <Link to={`/products/${product.slug}`}>
                  <GlowCard className="h-full flex flex-col" glowColor={i % 2 === 0 ? 'ocean' : 'purple'}>
                    <div className="h-32 bg-gradient-to-br from-ocean-900/30 to-purple-900/30 rounded-lg mb-4 flex items-center justify-center border border-dark-700/50">
                      <span className="text-3xl font-bold text-ocean-500/50">{product.name.charAt(0)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {product.category && <Badge variant="info" className="text-xs">{product.category}</Badge>}
                      {!product.isActive && <Badge variant="warning" className="text-xs">{t.comingSoon}</Badge>}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-sm text-dark-400 flex-1 line-clamp-2">{product.description}</p>
                  </GlowCard>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3} className="text-center mt-8">
            <Link to="/products">
              <NeonButton variant="ghost" className="gap-2">
                {t.products.learnMore} <ArrowIcon className="w-4 h-4" />
              </NeonButton>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.home.ourServices}</h2>
            <p className="text-dark-400 max-w-2xl mx-auto">{t.home.ourServicesDesc}</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {servicesData?.map((service, i) => (
              <AnimatedSection key={service.id} delay={i * 0.15}>
                <Link to={`/services/${service.slug}`}>
                  <GlowCard className="h-full" glowColor={i === 0 ? 'ocean' : 'purple'}>
                    <div className="w-14 h-14 bg-gradient-to-br from-ocean-600/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-4 border border-ocean-500/20">
                      <span className="text-2xl font-bold gradient-text">{service.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{service.name}</h3>
                    <p className="text-dark-400 text-sm line-clamp-3 mb-4">{service.description}</p>
                    <span className="text-sm text-ocean-400 flex items-center gap-1">
                      {t.services.learnMore} <ArrowIcon className="w-4 h-4" />
                    </span>
                  </GlowCard>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Careers CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ocean-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <GlowCard hover={false} className="text-center py-12 px-8">
              <div className="w-16 h-16 bg-ocean-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-ocean-500/20">
                <Briefcase className="w-8 h-8 text-ocean-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{t.home.joinTeam}</h2>
              <p className="text-dark-400 max-w-xl mx-auto mb-8">{t.home.joinTeamDesc}</p>
              <Link to="/careers">
                <NeonButton size="lg" className="gap-2">
                  {t.home.viewCareers} <ArrowIcon className="w-5 h-5" />
                </NeonButton>
              </Link>
            </GlowCard>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-2xl border border-dark-700/50 p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-ocean-900/30 via-purple-900/20 to-ocean-900/30" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
              <div className="relative">
                <MessageSquare className="w-10 h-10 text-ocean-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">{t.home.getInTouch}</h2>
                <p className="text-dark-400 mb-8 max-w-xl mx-auto">{t.home.getInTouchDesc}</p>
                <Link to="/contact">
                  <NeonButton variant="purple" size="lg" className="gap-2">
                    {t.home.contactUs} <ArrowIcon className="w-5 h-5" />
                  </NeonButton>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
