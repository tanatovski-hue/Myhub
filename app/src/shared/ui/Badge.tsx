import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export type BadgeTone = 'brand' | 'emerald' | 'amber' | 'danger' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-soft text-blue-300 border-brand/25',
  emerald: 'bg-emerald-soft text-emerald-300 border-emerald/25',
  amber: 'bg-amber-soft text-amber-300 border-amber/25',
  danger: 'bg-danger-soft text-red-300 border-danger/25',
  neutral: 'bg-white/5 text-ink-secondary border-subtle',
};

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
