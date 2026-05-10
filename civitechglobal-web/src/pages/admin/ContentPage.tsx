import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import api from '../../config/api';
import type { SiteContent, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { useLocale } from '../../hooks/useLocale';

const getContentKeys = (locale: string) => [
  { key: 'hero_title', label: locale === 'fa' ? '\u0639\u0646\u0648\u0627\u0646 \u0647\u06CC\u0631\u0648' : 'Hero Title' },
  { key: 'hero_subtitle', label: locale === 'fa' ? '\u0632\u06CC\u0631\u0639\u0646\u0648\u0627\u0646 \u0647\u06CC\u0631\u0648' : 'Hero Subtitle' },
  { key: 'about_mission', label: locale === 'fa' ? '\u062F\u0631\u0628\u0627\u0631\u0647 - \u0645\u0623\u0645\u0648\u0631\u06CC\u062A' : 'About - Mission' },
  { key: 'about_vision', label: locale === 'fa' ? '\u062F\u0631\u0628\u0627\u0631\u0647 - \u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632' : 'About - Vision' },
  { key: 'about_description', label: locale === 'fa' ? '\u062F\u0631\u0628\u0627\u0631\u0647 - \u062A\u0648\u0636\u06CC\u062D\u0627\u062A' : 'About - Description' },
];

export default function ContentPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const contentKeys = getContentKeys(locale);

  const { data, isLoading } = useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SiteContent[]>>('/content');
      return data.data;
    },
  });

  useEffect(() => {
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((item) => { map[item.key] = item.value; });
      setValues(map);
    }
  }, [data]);

  const saveMut = useMutation({
    mutationFn: async (key: string) => {
      await api.put(`/content/${key}`, { value: values[key] });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['site-content'] }); toast(t.admin.contentManagement.saveSuccess, 'success'); },
    onError: () => toast(t.admin.contentManagement.saveFailed, 'error'),
  });

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">{t.admin.contentManagement.title}</h1>

      <div className="space-y-6 max-w-3xl">
        {contentKeys.map(({ key, label }) => (
          <Card key={key}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-dark-900 dark:text-white">{label}</h3>
              <Button size="sm" className="gap-1" onClick={() => saveMut.mutate(key)} isLoading={saveMut.isPending}>
                <Save className="w-3 h-3" /> {t.save}
              </Button>
            </div>
            <TextArea
              value={values[key] || ''}
              onChange={(e) => setValues((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={`${label}...`}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
