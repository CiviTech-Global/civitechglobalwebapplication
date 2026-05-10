import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Globe, Shield, Zap, Users, Code, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useLocale } from '../../hooks/useLocale';
import { toPersianDigits } from '../../lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function HomePage() {
  const { t, isRtl } = useLocale();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const features = [
    { icon: Globe, title: t.home.features.civicEngagement, description: t.home.features.civicEngagementDesc },
    { icon: Shield, title: t.home.features.secureSolutions, description: t.home.features.secureSolutionsDesc },
    { icon: Zap, title: t.home.features.fastScalable, description: t.home.features.fastScalableDesc },
    { icon: Users, title: t.home.features.communityDriven, description: t.home.features.communityDrivenDesc },
    { icon: Code, title: t.home.features.customDev, description: t.home.features.customDevDesc },
    { icon: BarChart3, title: t.home.features.dataAnalytics, description: t.home.features.dataAnalyticsDesc },
  ];

  const stats = [
    { value: isRtl ? toPersianDigits('50+') : '50+', label: t.home.stats.projects },
    { value: isRtl ? toPersianDigits('100+') : '100+', label: t.home.stats.clients },
    { value: isRtl ? toPersianDigits('25+') : '25+', label: t.home.stats.team },
    { value: isRtl ? toPersianDigits('15+') : '15+', label: t.home.stats.countries },
  ];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-primary-900/10 dark:from-primary-600/5 dark:to-primary-900/5" />
        <div className="absolute top-20 start-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 end-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <motion.div className="text-center max-w-4xl mx-auto" {...fadeUp}>
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-full border border-primary-200 dark:border-primary-800">
              {t.home.badge}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-dark-900 dark:text-white leading-tight mb-6">
              {t.home.heroTitle}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                {t.home.heroTitleHighlight}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-dark-500 dark:text-dark-400 mb-8 max-w-2xl mx-auto">
              {t.home.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="gap-2">
                  {t.home.exploreProducts} <ArrowIcon className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">{t.home.learnMore}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-dark-50/50 dark:bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">{t.home.whatWeDo}</h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              {t.home.whatWeDoDesc}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
                <Card hover className="h-full">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-dark-500 dark:text-dark-400 text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" {...fadeUp}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">{stat.value}</div>
                <div className="text-dark-500 dark:text-dark-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-12 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">{t.home.readyToTransform}</h2>
              <p className="text-primary-100 mb-8 max-w-xl mx-auto">
                {t.home.readyToTransformDesc}
              </p>
              <Link to="/support">
                <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                  {t.home.contactUs}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
