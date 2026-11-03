import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  heading?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function Card({ className, heading, subtitle, icon, actions, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-subtle bg-surface-glass backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.35)]',
        className,
      )}
      {...props}
    >
      {(heading || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-subtle px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && <span className="shrink-0 text-brand">{icon}</span>}
            <div className="min-w-0">
              {heading && <h2 className="truncate text-sm font-semibold text-ink-primary">{heading}</h2>}
              {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
