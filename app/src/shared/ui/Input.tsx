import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

const baseField =
  'w-full rounded-md border bg-surface-input px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted ' +
  'transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(baseField, invalid && 'border-danger focus:ring-danger/40', className)}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(baseField, 'resize-y leading-relaxed', invalid && 'border-danger focus:ring-danger/40', className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(baseField, 'cursor-pointer appearance-none', className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
