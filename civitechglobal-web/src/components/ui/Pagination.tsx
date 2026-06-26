import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { useLocale } from '../../hooks/useLocale';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const { t, isRtl } = useLocale();

  if (totalPages <= 1) return null;

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        <PrevIcon className="w-4 h-4" />
      </Button>
      <span className="text-sm text-dark-400 px-3">
        {t.page} {page} {t.of} {totalPages}
      </span>
      <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        <NextIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
