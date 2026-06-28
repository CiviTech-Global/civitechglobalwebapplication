import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Target, Eye, Lightbulb, Shield, Users, Award } from 'lucide-react';
import api from '../../config/api';
import { Card } from '../../components/ui/Card';
import { useLocale } from '../../hooks/useLocale';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function AboutPage() {
  const { t } = useLocale();

  const { data: content } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const { data } = await api.get('/content');
      const map: Record<string, string> = {};
      data.data?.forEach((item: { key: string; value: string }) => { map[item.key] = item.value; });
      return map;
    },
  });

  const values = [
    { icon: Lightbulb, title: t.about.innovation, desc: t.about.innovationDesc },
    { icon: Shield, title: t.about.transparency, desc: t.about.transparencyDesc },
    { icon: Users, title: t.about.community, desc: t.about.communityDesc },
    { icon: Award, title: t.about.excellence, desc: t.about.excellenceDesc },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div className="text-center mb-16" {...fadeUp}>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">{t.about.title}</h1>
        <p className="text-text-muted max-w-2xl mx-auto">{t.about.subtitle}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <motion.div {...fadeUp}>
          <Card className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-green-50 dark:bg-brand-green-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-brand-green-600 dark:text-brand-green-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">{t.about.ourMission}</h2>
            </div>
            <p className="text-text-muted">
              {content?.about_mission || t.about.missionDefault}
            </p>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <Card className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-green-50 dark:bg-brand-green-900/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-brand-green-600 dark:text-brand-green-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">{t.about.ourVision}</h2>
            </div>
            <p className="text-text-muted">
              {content?.about_vision || t.about.visionDefault}
            </p>
          </Card>
        </motion.div>
      </div>

      <motion.div className="mb-16" {...fadeUp}>
        <h2 className="text-2xl font-bold text-text-primary mb-4">{t.about.whoWeAre}</h2>
        <p className="text-text-muted text-lg leading-relaxed">
          {content?.about_description || t.about.descriptionDefault}
        </p>
      </motion.div>

      <motion.div {...fadeUp}>
        <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">{t.about.values}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
              <Card hover className="text-center h-full">
                <div className="w-12 h-12 bg-brand-green-50 dark:bg-brand-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-brand-green-600 dark:text-brand-green-400" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{v.title}</h3>
                <p className="text-sm text-text-muted">{v.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
