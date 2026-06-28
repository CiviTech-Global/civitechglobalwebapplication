import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MapPin, Clock, Briefcase, GraduationCap } from 'lucide-react';
import api from '../../config/api';
import type { Opportunity, ApiResponse } from '../../types';
import { NeonButton } from '../../components/ui/NeonButton';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { TextArea } from '../../components/ui/TextArea';
import { Input } from '../../components/ui/Input';
import { GlowCard } from '../../components/ui/GlowCard';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';

export default function OpportunityDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRtl } = useLocale();
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const { data: opportunity, isLoading } = useQuery({
    queryKey: ['opportunity', slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Opportunity>>(`/opportunities/${slug}`);
      return data.data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/opportunities/${opportunity!.id}/apply`, { coverLetter, resumeUrl });
    },
    onSuccess: () => {
      toast(t.careers.applySuccess, 'success');
      navigate('/dashboard/opportunities');
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || t.careers.applyFailed, 'error');
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/careers/${slug}` } } });
      return;
    }
    setShowForm(true);
  };

  if (isLoading) return <Spinner size="lg" />;
  if (!opportunity) return <div className="text-center py-20 text-text-muted">{t.careers.notFound}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-green-500 transition-colors mb-8">
        <BackIcon className="w-4 h-4" /> {t.careers.backToCareers}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant={opportunity.opportunityType === 'JOB' ? 'info' : 'success'} className="gap-1">
            {opportunity.opportunityType === 'JOB' ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
            {opportunity.opportunityType === 'JOB' ? t.careers.job : t.careers.internship}
          </Badge>
          <Badge variant={opportunity.isOpen ? 'default' : 'danger'}>
            {opportunity.isOpen ? t.careers.open : t.careers.closed}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-4">{opportunity.title}</h1>

        <div className="flex items-center gap-6 text-sm text-text-muted mb-6">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {opportunity.location}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {opportunity.duration}</span>
        </div>

        <p className="text-text-secondary mb-8 text-lg leading-relaxed">{opportunity.description}</p>

        {opportunity.requirements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-text-primary mb-3">{t.careers.requirements}</h3>
            <ul className="space-y-2">
              {opportunity.requirements.map((r) => (
                <li key={r} className="flex items-center gap-2 text-text-secondary">
                  <Check className="w-4 h-4 text-brand-green-500 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!showForm ? (
          <NeonButton size="lg" onClick={handleApply} disabled={!opportunity.isOpen}>
            {opportunity.isOpen ? t.careers.applyNow : t.careers.closed}
          </NeonButton>
        ) : (
          <GlowCard hover={false} className="max-w-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{t.careers.applyNow}</h3>
            <div className="space-y-4">
              <TextArea
                label={t.careers.coverLetter}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={t.careers.coverLetterPlaceholder}
                required
              />
              <Input
                label={t.careers.resumeUrl}
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder={t.careers.resumeUrlPlaceholder}
              />
              <div className="flex gap-3">
                <NeonButton onClick={() => applyMutation.mutate()} isLoading={applyMutation.isPending}>{t.submit}</NeonButton>
                <NeonButton variant="ghost" onClick={() => setShowForm(false)}>{t.cancel}</NeonButton>
              </div>
            </div>
          </GlowCard>
        )}
      </motion.div>
    </div>
  );
}
