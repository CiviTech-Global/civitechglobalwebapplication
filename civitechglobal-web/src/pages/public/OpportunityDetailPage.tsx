import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MapPin, Clock, Briefcase, GraduationCap } from 'lucide-react';
import api from '../../config/api';
import type { Opportunity, ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { TextArea } from '../../components/ui/TextArea';
import { Input } from '../../components/ui/Input';
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
      toast(t.opportunities.applySuccess, 'success');
      navigate('/dashboard/opportunities');
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || t.opportunities.applyFailed, 'error');
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/opportunities/${slug}` } } });
      return;
    }
    setShowForm(true);
  };

  if (isLoading) return <Spinner size="lg" />;
  if (!opportunity) return <div className="text-center py-20 text-dark-500">{t.opportunities.notFound}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 mb-8">
        <BackIcon className="w-4 h-4" /> {t.opportunities.backToOpportunities}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant={opportunity.opportunityType === 'JOB' ? 'info' : 'success'} className="gap-1">
            {opportunity.opportunityType === 'JOB' ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
            {opportunity.opportunityType === 'JOB' ? t.opportunities.job : t.opportunities.internship}
          </Badge>
          <Badge variant={opportunity.isOpen ? 'default' : 'danger'}>
            {opportunity.isOpen ? t.opportunities.open : t.opportunities.closed}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">{opportunity.title}</h1>

        <div className="flex items-center gap-6 text-sm text-dark-500 dark:text-dark-400 mb-6">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {opportunity.location}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {opportunity.duration}</span>
        </div>

        <p className="text-dark-600 dark:text-dark-300 mb-8 text-lg">{opportunity.description}</p>

        {opportunity.requirements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-3">{t.opportunities.requirements}</h3>
            <ul className="space-y-2">
              {opportunity.requirements.map((r) => (
                <li key={r} className="flex items-center gap-2 text-dark-600 dark:text-dark-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!showForm ? (
          <Button size="lg" onClick={handleApply} disabled={!opportunity.isOpen}>
            {opportunity.isOpen ? t.opportunities.applyNow : t.opportunities.closed}
          </Button>
        ) : (
          <div className="max-w-lg bg-dark-50 dark:bg-dark-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">{t.opportunities.applyNow}</h3>
            <div className="space-y-4">
              <TextArea
                label={t.opportunities.coverLetter}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={t.opportunities.coverLetterPlaceholder}
                required
              />
              <Input
                label={t.opportunities.resumeUrl}
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder={t.opportunities.resumeUrlPlaceholder}
              />
              <div className="flex gap-3">
                <Button onClick={() => applyMutation.mutate()} isLoading={applyMutation.isPending}>{t.submit}</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
