import { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import api from '../../config/api';
import { NeonButton } from '../../components/ui/NeonButton';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { GlowCard } from '../../components/ui/GlowCard';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';

export default function ContactPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    subject: '',
    category: 'SUPPORT',
    description: '',
    priority: 'MEDIUM',
  });

  const categoryOptions = [
    { value: 'SUPPORT', label: t.contact.categories.SUPPORT },
    { value: 'SALES', label: t.contact.categories.SALES },
    { value: 'DEMO_REQUEST', label: t.contact.categories.DEMO_REQUEST },
    { value: 'PARTNERSHIP', label: t.contact.categories.PARTNERSHIP },
    { value: 'OTHER', label: t.contact.categories.OTHER },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets', form);
      toast(t.contact.submitSuccess, 'success');
      setForm({ name: '', email: '', subject: '', category: 'SUPPORT', description: '', priority: 'MEDIUM' });
    } catch {
      toast(t.contact.submitFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.contact.title}</h1>
        <p className="text-dark-400 max-w-2xl mx-auto">{t.contact.description}</p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <AnimatedSection delay={0.1}>
            <GlowCard hover={false}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label={t.contact.name} value={form.name} onChange={update('name')} placeholder={t.contact.namePlaceholder} required />
                  <Input label={t.contact.email} type="email" value={form.email} onChange={update('email')} placeholder={t.contact.emailPlaceholder} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label={t.contact.subject} value={form.subject} onChange={update('subject')} placeholder={t.contact.subjectPlaceholder} required />
                  <Select label={t.contact.category} value={form.category} onChange={update('category')} options={categoryOptions} />
                </div>
                <TextArea label={t.contact.message} value={form.description} onChange={update('description')} placeholder={t.contact.messagePlaceholder} required />
                <NeonButton type="submit" isLoading={loading} className="w-full gap-2">
                  <Send className="w-4 h-4" /> {t.contact.submit}
                </NeonButton>
              </form>
            </GlowCard>
          </AnimatedSection>
        </div>

        <div>
          <AnimatedSection delay={0.2}>
            <GlowCard hover={false} glowColor="purple" className="space-y-6">
              <h3 className="text-lg font-semibold text-white">{t.contact.info.title}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-dark-300">
                  <div className="w-10 h-10 rounded-lg bg-ocean-900/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-ocean-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">{t.contact.email}</p>
                    <p className="text-sm">{t.contact.info.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-dark-300">
                  <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">Location</p>
                    <p className="text-sm">{t.contact.info.location}</p>
                  </div>
                </div>
              </div>
            </GlowCard>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
