/** Экран «🥊 Тренажёр возражений B2B» (legacy screen #trainer): 2 режима — карточки 15с и спарринг-арена */
import { useState } from 'react';
import { Layers, Swords } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { FlashcardsWidget } from '@/widgets/trainer/FlashcardsWidget';
import { ArenaWidget } from '@/widgets/trainer/ArenaWidget';

type TrainerMode = 'flashcards' | 'arena';

const MODES: { id: TrainerMode; label: string; icon: typeof Layers }[] = [
  { id: 'flashcards', label: 'Карточки 15 секунд', icon: Layers },
  { id: 'arena', label: 'Спарринг-арена (оценка 1–100)', icon: Swords },
];

export function TrainerPage() {
  const [mode, setMode] = useState<TrainerMode>('flashcards');

  return (
    <section>
      <div className="mb-4">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-brand">
          Модуль 04 · Спарринг с ЛПР
        </span>
        <h1 className="mt-1 text-xl font-bold text-ink-primary sm:text-2xl">Тренажёр возражений B2B</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
          6 жёстких реальных возражений ЛПР. Отработай перехват на скорость за 15 секунд, затем примай
          боевой спарринг с оценкой ответа по 4 твёрдым аргументам.
        </p>
      </div>

      {/* Переключатель режимов (legacy data-trainer-mode) */}
      <div role="tablist" aria-label="Режимы тренажёра" className="mb-4 flex flex-wrap gap-2">
        {MODES.map(({ id, label, icon: Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-brand bg-brand-soft text-ink-primary'
                  : 'border-subtle bg-surface-elevated text-ink-secondary hover:border-hover hover:text-ink-primary',
              )}
            >
              <Icon size={15} className={active ? 'text-brand' : ''} />
              {label}
            </button>
          );
        })}
      </div>

      {mode === 'flashcards' ? <FlashcardsWidget /> : <ArenaWidget />}
    </section>
  );
}
