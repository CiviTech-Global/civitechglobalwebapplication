import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../config/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { slugify } from '../../lib/utils';
import { useLocale } from '../../hooks/useLocale';

export default function OpportunityFormPage() {
  const { t, isRtl } = useLocale();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [form, setForm] = useState({ title: '', slug: '', description: '', requirements: '', duration: '', location: '', type: 'Remote', opportunityType: 'INTERNSHIP', isOpen: true });

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (isEdit) {
      api.get(`/opportunities/admin/all?limit=100`).then(({ data }) => {
        const item = data.data.find((i: any) => i.id === id);
        if (item) {
          setForm({
            title: item.title, slug: item.slug, description: item.description,
            requirements: item.requirements.join(', '), duration: item.duration,
            location: item.location, type: item.type, opportunityType: item.opportunityType || 'INTERNSHIP', isOpen: item.isOpen,
          });
        }
      }).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = {
      title: form.title, slug: form.slug || slugify(form.title), description: form.description,
      requirements: form.requirements ? form.requirements.split(',').map((r) => r.trim()).filter(Boolean) : [],
      duration: form.duration, location: form.location, type: form.type, opportunityType: form.opportunityType, isOpen: form.isOpen,
    };
    try {
      if (isEdit) { await api.put(`/opportunities/${id}`, body); toast(t.admin.opportunityForm.saveSuccess, 'success'); }
      else { await api.post('/opportunities', body); toast(t.admin.opportunityForm.saveSuccess, 'success'); }
      navigate('/admin/opportunities');
    } catch (err: any) {
      toast(err.response?.data?.message || t.admin.opportunityForm.saveFailed, 'error');
    } finally { setLoading(false); }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  if (fetching) return <Spinner size="lg" />;

  return (
    <div>
      <Link to="/admin/opportunities" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 mb-6">
        <BackArrow className="w-4 h-4" /> {t.opportunities.backToOpportunities}
      </Link>
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">{isEdit ? t.admin.opportunityForm.editTitle : t.admin.opportunityForm.createTitle}</h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t.admin.opportunityForm.title} value={form.title} onChange={update('title')} required />
          <Input label={t.admin.opportunityForm.slug} value={form.slug} onChange={update('slug')} placeholder={t.admin.opportunityForm.slugPlaceholder} />
          <TextArea label={t.admin.opportunityForm.description} value={form.description} onChange={update('description')} required />
          <Input label={t.admin.opportunityForm.requirements} value={form.requirements} onChange={update('requirements')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.admin.opportunityForm.duration} value={form.duration} onChange={update('duration')} placeholder={t.admin.opportunityForm.durationPlaceholder} required />
            <Input label={t.admin.opportunityForm.location} value={form.location} onChange={update('location')} placeholder={t.admin.opportunityForm.locationPlaceholder} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.admin.opportunityForm.type} value={form.type} onChange={update('type')} placeholder={t.admin.opportunityForm.typePlaceholder} />
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">{t.admin.opportunityForm.opportunityType}</label>
              <select
                value={form.opportunityType}
                onChange={update('opportunityType')}
                className="w-full px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="INTERNSHIP">{t.opportunities.internship}</option>
                <option value="JOB">{t.opportunities.job}</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isOpen} onChange={(e) => setForm((p) => ({ ...p, isOpen: e.target.checked }))} className="rounded" />
            <span className="text-dark-700 dark:text-dark-300">{t.admin.opportunityForm.isOpen}</span>
          </label>
          <div className="flex gap-3">
            <Button type="submit" isLoading={loading}>{isEdit ? t.edit : t.create}</Button>
            <Link to="/admin/opportunities"><Button variant="outline" type="button">{t.cancel}</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
