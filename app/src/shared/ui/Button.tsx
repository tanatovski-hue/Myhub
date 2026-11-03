import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghostDanger' | 'whatsapp' | 'telegram';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand hover:bg-brand-hover text-white border-transparent shadow-[0_4px_14px_rgba(37,99,235,0.35)]',
  secondary: 'bg-surface-elevated hover:border-hover text-ink-primary border-subtle',
  ghost: 'bg-transparent hover:bg-white/5 text-ink-secondary border-transparent hover:text-ink-primary',
  ghostDanger: 'bg-danger-soft hover:bg-danger/25 text-danger border-transparent',
  whatsapp: 'bg-whatsapp hover:brightness-110 text-white border-transparent',
  telegram: 'bg-telegram hover:brightness-110 text-white border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
  icon: 'h-8 w-8 p-0 gap-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
