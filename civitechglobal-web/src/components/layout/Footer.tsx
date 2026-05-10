import { Link } from 'react-router';
import { Globe, MessageCircle, Briefcase, Mail } from 'lucide-react';
import { useLocale } from '../../hooks/useLocale';

export function Footer() {
  const { t } = useLocale();

  const footerLinks = {
    [t.footer.product]: [
      { to: '/products', label: t.footer.products },
      { to: '/services', label: t.footer.services },
      { to: '/opportunities', label: t.footer.opportunities },
    ],
    [t.footer.company]: [
      { to: '/about', label: t.footer.aboutUs },
      { to: '/support', label: t.footer.support },
    ],
    [t.footer.legal]: [
      { to: '#', label: t.footer.privacy },
      { to: '#', label: t.footer.terms },
    ],
  };

  return (
    <footer className="bg-dark-50 dark:bg-dark-900 border-t border-dark-200 dark:border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CT</span>
              </div>
              <span className="font-bold text-lg text-dark-900 dark:text-white">{t.brand}</span>
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
              {t.footer.description}
            </p>
            <div className="flex gap-3">
              {[Globe, MessageCircle, Briefcase, Mail].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg hover:bg-dark-200 dark:hover:bg-dark-800 text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-dark-900 dark:text-white mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-dark-500 hover:text-primary-600 dark:text-dark-400 dark:hover:text-primary-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-dark-200 dark:border-dark-800">
          <p className="text-sm text-center text-dark-500 dark:text-dark-400">
            &copy; {new Date().getFullYear()} {t.brand}. {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
