import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { useLocale } from '../../hooks/useLocale';
import { toPersianDigits } from '../../lib/utils';

export default function NotFoundPage() {
  const { t, locale } = useLocale();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary-600 dark:text-primary-400 mb-4">{locale === 'fa' ? toPersianDigits(404) : '404'}</h1>
        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">{t.notFound.title}</h2>
        <p className="text-dark-500 dark:text-dark-400 mb-8">{t.notFound.description}</p>
        <Link to="/"><Button size="lg">{t.notFound.backHome}</Button></Link>
      </div>
    </div>
  );
}
