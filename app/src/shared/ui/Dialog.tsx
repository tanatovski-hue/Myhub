import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Доступный модальный диалог без сторонних зависимостей (замена hidden-модалок legacy) */
export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full max-w-md rounded-lg border border-subtle bg-surface-elevated shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-subtle px-5 py-3">
          <h3 className="text-sm font-semibold text-ink-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть диалог"
            className="rounded-md p-1 text-ink-muted transition-colors hover:bg-white/5 hover:text-ink-primary"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
