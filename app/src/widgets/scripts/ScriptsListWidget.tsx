/** Виджет: категории и список шаблонов скриптов (legacy renderScripts левая колонка) */
import { Flame, Layers, MessageSquarePlus, ServerCrash, ShieldAlert } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { useAppStore } from '@/shared/lib/store';
import { cn } from '@/shared/lib/utils';
import { SCRIPT_CATEGORIES, type ScriptCategoryMeta } from '@/entities/script/model';

const CATEGORY_ICONS: Record<ScriptCategoryMeta['icon'], typeof Layers> = {
  layers: Layers,
  'message-square-plus': MessageSquarePlus,
  'shield-alert': ShieldAlert,
  'server-crash': ServerCrash,
  flame: Flame,
};

export interface ScriptsListWidgetProps {
  activeCategory: string;
  activeScriptId: string | null;
  onCategoryChange: (category: string) => void;
  onSelectScript: (id: string) => void;
}

export function ScriptsListWidget({
  activeCategory,
  activeScriptId,
  onCategoryChange,
  onSelectScript,
}: ScriptsListWidgetProps) {
  const scripts = useAppStore((s) => s.scripts);

  const filtered =
    activeCategory === 'all' ? scripts : scripts.filter((sc) => sc.category === activeCategory);

  return (
    <Card heading="Категории сценариев" subtitle="Выберите тактику контакта" icon={<Layers size={16} />}>
      {/* Pills категорий */}
      <div role="tablist" aria-label="Категории скриптов" className="flex flex-wrap gap-2">
        {(() => {
          const AllIcon = CATEGORY_ICONS.layers;
          const active = activeCategory === 'all';
          return (
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange('all')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-brand/40 bg-brand-soft text-blue-300'
                  : 'border-subtle bg-surface-input text-ink-secondary hover:border-hover hover:text-ink-primary',
              )}
            >
              <AllIcon size={14} />
              Все сценарии ({scripts.length})
            </button>
          );
        })()}
        {SCRIPT_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.icon];
          const active = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange(cat.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-brand/40 bg-brand-soft text-blue-300'
                  : 'border-subtle bg-surface-input text-ink-secondary hover:border-hover hover:text-ink-primary',
              )}
            >
              <Icon size={14} />
              {cat.key}
            </button>
          );
        })}
      </div>

      {/* Список шаблонов выбранной категории */}
      <div role="listbox" aria-label="Шаблоны выбранной категории" className="mt-4 space-y-1.5">
        {filtered.length === 0 && (
          <p className="rounded-md border border-dashed border-subtle p-4 text-center text-xs text-ink-muted">
            В этой категории пока нет скриптов. Создайте свой кнопкой «+ Свой скрипт».
          </p>
        )}
        {filtered.map((sc) => {
          const active = sc.id === activeScriptId;
          return (
            <button
              key={sc.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelectScript(sc.id)}
              className={cn(
                'block w-full rounded-md border px-3 py-2 text-left text-xs leading-relaxed transition-colors',
                active
                  ? 'border-brand/40 bg-brand-soft text-ink-primary'
                  : 'border-transparent text-ink-secondary hover:border-subtle hover:bg-white/5 hover:text-ink-primary',
              )}
            >
              <span className="line-clamp-2">{sc.title}</span>
              {activeCategory === 'all' && (
                <Badge tone="neutral" className="mt-1.5">
                  {sc.category}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

    </Card>
  );
}
