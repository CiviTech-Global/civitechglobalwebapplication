import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, ArrowLeft, ArrowRight, Briefcase, GraduationCap } from 'lucide-react';
import api from '../../config/api';
import type { Opportunity, ApiResponse } from '../../types';
import { GlowCard } from '../../components/ui/GlowCard';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { useLocale } from '../../hooks/useLocale';

export default function CareersPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>('');
  const { t, isRtl } = useLocale();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '9' });
      if (filter) params.set('type', filter);
      const { data } = await api.get<ApiResponse<Opportunity[]>>(`/opportunities?${params}`);
      return data;
    },
  });

  const tabs = [
    { key: '', label: t.careers.all },
    { key: 'JOB', label: t.careers.jobs },
    { key: 'INTERNSHIP', label: t.careers.internshipsOnly },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">{t.careers.title}</h1>
        <p className="text-text-muted max-w-2xl mx-auto">{t.careers.description}</p>
      </AnimatedSection>

      <div className="flex justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === tab.key
                ? 'bg-gradient-to-r from-brand-green-600 to-brand-amber-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-surface-200 text-text-secondary hover:bg-surface-300 hover:text-text-primary border border-border-default'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((opportunity, i) => (
              <AnimatedSection key={opportunity.id} delay={i * 0.1}>
                <Link to={`/careers/${opportunity.slug}`}>
                  <GlowCard className="h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={opportunity.opportunityType === 'JOB' ? 'info' : 'success'} className="gap-1">
                        {opportunity.opportunityType === 'JOB' ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                        {opportunity.opportunityType === 'JOB' ? t.careers.job : t.careers.internship}
                      </Badge>
                      {opportunity.isOpen && <Badge variant="default">{t.careers.open}</Badge>}
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{opportunity.title}</h3>
                    <p className="text-sm text-text-muted flex-1 line-clamp-2 mb-4">{opportunity.description}</p>
                    <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{opportunity.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{opportunity.duration}</span>
                    </div>
                    <span className="text-sm text-brand-green-500 flex items-center gap-1">
                      {t.careers.viewDetails} <ArrowIcon className="w-4 h-4" />
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
