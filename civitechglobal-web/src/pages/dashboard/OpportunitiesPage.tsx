import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning', REVIEWING: 'info', ACCEPTED: 'success', REJECTED: 'danger',
};

export default function OpportunitiesPage() {
  const { t } = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/opportunities/user/applications');
      return data;
    },
  });

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t.dashboard.myApplications}</h1>

      {(!data?.data || data.data.length === 0) ? (
        <Card><p className="text-center text-text-muted py-8">{t.dashboard.noApplications}</p></Card>
      ) : (
        <div className="space-y-4">
          {data.data.map((app: any) => (
            <Card key={app.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">{app.opportunity?.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={app.opportunity?.opportunityType === 'JOB' ? 'info' : 'success'} className="text-xs">
                      {app.opportunity?.opportunityType === 'JOB' ? t.opportunities.job : t.opportunities.internship}
                    </Badge>
                    <span className="text-sm text-text-muted">{formatDate(app.createdAt)}</span>
                  </div>
                </div>
                <Badge variant={statusVariants[app.status]}>
                  {t.admin.applicationStatus[app.status as keyof typeof t.admin.applicationStatus]}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
