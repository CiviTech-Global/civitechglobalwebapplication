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

export default function ProductFormPage() {
  const { t, isRtl } = useLocale();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', category: '', features: '', image: '', githubUrl: '', isActive: true });

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (isEdit) {
      api.get(`/products?limit=100`).then(({ data }) => {
        const product = data.data.find((p: any) => p.id === id);
        if (product) {
          setForm({
            name: product.name, slug: product.slug, description: product.description,
            price: product.price ? String(product.price) : '', category: product.category || '', features: product.features.join(', '),
            image: product.image || '', githubUrl: product.githubUrl || '', isActive: product.isActive,
          });
        }
      }).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = {
      name: form.name, slug: form.slug || slugify(form.name), description: form.description,
      price: form.price ? parseFloat(form.price) : undefined, category: form.category || undefined,
      features: form.features ? form.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
      image: form.image || undefined, githubUrl: form.githubUrl || undefined, isActive: form.isActive,
    };
    try {
      if (isEdit) { await api.put(`/products/${id}`, body); toast(t.admin.productForm.saveSuccess, 'success'); }
      else { await api.post('/products', body); toast(t.admin.productForm.saveSuccess, 'success'); }
      navigate('/admin/products');
    } catch (err: any) {
      toast(err.response?.data?.message || t.admin.productForm.saveFailed, 'error');
    } finally { setLoading(false); }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  if (fetching) return <Spinner size="lg" />;

  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 mb-6">
        <BackArrow className="w-4 h-4" /> {t.products.backToProducts}
      </Link>
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">{isEdit ? t.admin.productForm.editTitle : t.admin.productForm.createTitle}</h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t.admin.productForm.name} value={form.name} onChange={update('name')} required />
          <Input label={t.admin.productForm.slug} value={form.slug} onChange={update('slug')} placeholder={t.admin.productForm.slugPlaceholder} />
          <TextArea label={t.admin.productForm.description} value={form.description} onChange={update('description')} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.admin.productForm.price} type="number" step="0.01" value={form.price} onChange={update('price')} />
            <Input label={t.admin.productForm.category} value={form.category} onChange={update('category')} />
          </div>
          <Input label={t.admin.productForm.githubUrl} value={form.githubUrl} onChange={update('githubUrl')} placeholder="https://github.com/..." />
          <Input label={t.admin.productForm.features} value={form.features} onChange={update('features')} placeholder={t.admin.productForm.featuresPlaceholder} />
          <Input label={t.admin.productForm.image} value={form.image} onChange={update('image')} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded" />
            <span className="text-dark-700 dark:text-dark-300">{t.admin.productForm.isActive}</span>
          </label>
          <div className="flex gap-3">
            <Button type="submit" isLoading={loading}>{isEdit ? t.edit : t.create}</Button>
            <Link to="/admin/products"><Button variant="outline" type="button">{t.cancel}</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
