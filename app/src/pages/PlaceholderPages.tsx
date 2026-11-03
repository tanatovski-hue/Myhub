import type { ReactNode } from 'react';
import { Construction } from 'lucide-react';
import { Card } from '@/shared/ui/Card';

/** Временная заглушка: экраны CRM / Скрипты / Тренажёр / Настройки мигрируются следующими шагами */
export function PlaceholderPage({ title, kicker }: { title: string; kicker: string }) {
  return (
    <section>
      <div className="mb-4">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-brand">{kicker}</span>
        <h1 className="mt-1 text-xl font-bold text-ink-primary sm:text-2xl">{title}</h1>
      </div>
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Construction size={28} className="text-amber" />
          <p className="max-w-md text-sm text-ink-secondary">
            Экран «{title}» будет перенесён из legacy `script.js` следующим шагом миграции. Сейчас активен
            Дашборд (Калькулятор).
          </p>
        </div>
      </Card>
    </section>
  );
}

export const ScriptsPlaceholder = (): ReactNode => <PlaceholderPage title="Боевые скрипты 2026" kicker="Модуль 03 · Библиотека касаний" />;
export const TrainerPlaceholder = (): ReactNode => <PlaceholderPage title="Тренажёр возражений" kicker="Модуль 04 · Спарринг с ЛПР" />;
export const SettingsPlaceholder = (): ReactNode => <PlaceholderPage title="Настройки системы" kicker="Модуль 05 · Данные и экспорт" />;
