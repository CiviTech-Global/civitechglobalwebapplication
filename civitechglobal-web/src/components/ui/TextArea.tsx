import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, error, className, id, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full px-3 py-2 rounded-lg border bg-surface-50 text-text-primary placeholder:text-text-muted border-border-default',
          'focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-transparent',
          'transition-colors resize-y',
          error && 'border-brand-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-brand-red-600">{error}</p>}
    </div>
  );
});

TextArea.displayName = 'TextArea';
