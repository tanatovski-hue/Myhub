import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Archive,
  BookOpen,
  Calculator,
  LayoutGrid,
  Pencil,
  Radar,
  Settings,
  Swords,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAppStore } from '@/shared/lib/store';
import { cn, formatNumber } from '@/shared/lib/utils';
import { downloadBackupZip } from '@/features/backup/model';
import { Dialog } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export interface SectionMeta {
  id: string;
  path: string;
  title: string;
  kicker: string;
  icon: LucideIcon;
}

/** Единый реестр экранов (исправляет рассинхрон titles/ids из legacy switchScreen) */
export const SECTIONS: SectionMeta[] = [
  { id: 'dashboard', path: '/', title: 'Дашборд и Калькулятор КП', kicker: 'Модуль 01 · Расчёт ТЭО и окупаемости', icon: Calculator },
  { id: 'crm', path: '/crm', title: 'База клиентов и Умный импорт', kicker: 'Модуль 02 · CRM и парсер таблиц', icon: Users },
  { id: 'scripts', path: '/scripts', title: 'Боевые скрипты 2026', kicker: 'Модуль 03 · Библиотека касаний', icon: BookOpen },
  { id: 'trainer', path: '/trainer', title: 'Тренажёр возражений', kicker: 'Модуль 04 · Спарринг с ЛПР', icon: Swords },
  { id: 'settings', path: '/settings', title: 'Настройки системы', kicker: 'Модуль 05 · Данные и экспорт', icon: Settings },
];

type MetricKey = 'revenue' | 'contracts' | 'touches';

const METRIC_MAP: Record<MetricKey, { factKey: 'moneyFact' | 'dealsFact' | 'touchFact'; planKey: 'moneyPlan' | 'dealsPlan' | 'touchPlan'; titleKey: 'moneyTitle' | 'dealsTitle' | 'touchTitle' }> = {
  revenue: { factKey: 'moneyFact', planKey: 'moneyPlan', titleKey: 'moneyTitle' },
  contracts: { factKey: 'dealsFact', planKey: 'dealsPlan', titleKey: 'dealsTitle' },
  touches: { factKey: 'touchFact', planKey: 'touchPlan', titleKey: 'touchTitle' },
};

interface KpiCardProps {
  label: string;
  value: number;
  target: ReactNode;
  percent: number;
  barClass: string;
  onEdit: () => void;
  step?: { label: string; onClick: () => void; primary?: boolean };
}

/** Исправленная шапка KPI: grid вместо flex — не ломается на мобильных (legacy-проблема №3) */
function KpiMetricCard({ label, value, target, percent, barClass, onEdit, step }: KpiCardProps) {
  return (
    <div className="min-w-0 rounded-md border border-subtle bg-surface px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</span>
        {step && (
          <button
            type="button"
            onClick={step.onClick}
            aria-label={step.label}
            title={step.label}
            className={cn(
              'h-6 shrink-0 rounded border px-2 text-xs font-bold transition-colors',
              step.primary
                ? 'border-transparent bg-brand text-white hover:bg-brand-hover'
                : 'border-subtle bg-surface-elevated text-ink-secondary hover:text-ink-primary',
            )}
          >
            +1
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        title="Нажмите для быстрого изменения метрики"
        className="mt-0.5 flex w-full items-baseline gap-1.5 text-left"
      >
        <span className="tabular-nums text-base font-bold text-ink-primary">{formatNumber(value)}</span>
        <span className="text-xs text-ink-muted">/</span>
        <span className="tabular-nums truncate text-xs text-ink-secondary">{target}</span>
        <Pencil size={11} className="ml-auto shrink-0 text-ink-muted" />
      </button>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
        <div className={cn('h-full rounded-full transition-all duration-300', barClass)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function AppHeader() {
  const kpi = useAppStore((s) => s.kpi);
  const companyName = useAppStore((s) => s.companyName);
  const incrementTouch = useAppStore((s) => s.incrementTouch);
  const incrementDeal = useAppStore((s) => s.incrementDeal);
  const updateKpi = useAppStore((s) => s.updateKpi);

  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricKey | null>(null);
  const [editCurrent, setEditCurrent] = useState('0');
  const [editTarget, setEditTarget] = useState('1');

  const pct = (fact: number, plan: number) => Math.min(100, Math.round((fact / Math.max(1, plan)) * 100));

  const openMetricEditor = (key: MetricKey) => {
    const cfg = METRIC_MAP[key];
    setEditingMetric(key);
    setEditCurrent(String(kpi[cfg.factKey]));
    setEditTarget(String(kpi[cfg.planKey]));
  };

  const saveMetric = () => {
    if (!editingMetric) return;
    const cfg = METRIC_MAP[editingMetric];
    updateKpi({
      [cfg.factKey]: Math.max(0, Number(editCurrent) || 0),
      [cfg.planKey]: Math.max(1, Number(editTarget) || 1),
    });
    setEditingMetric(null);
    toast.success('Метрика плана продаж обновлена');
  };

  const activeTitle = useLocation().pathname;

  // Хоткей ⌘K / Ctrl-K открывает Launchpad (как в legacy)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setLaunchpadOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const currentSection =
    SECTIONS.find((s) => s.path === activeTitle) ?? SECTIONS[0];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-subtle bg-canvas/85 backdrop-blur-md" role="banner">
        <div className="mx-auto grid max-w-[1400px] gap-3 px-4 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          {/* Бренд */}
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
              <Radar size={18} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-bold text-ink-primary">
                <span className="truncate">{companyName}</span>
                <span className="text-ink-muted">·</span>
                <span className="font-mono text-xs text-brand">HuntOS</span>
              </div>
              <span className="block truncate text-[11px] text-ink-secondary">{currentSection.title}</span>
            </div>
          </div>

          {/* 3 метрики — адаптивная сетка (was: flex, ломалась на мобильных) */}
          <div role="region" aria-label="План продаж и ключевые показатели" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <KpiMetricCard
              label={kpi.moneyTitle}
              value={kpi.moneyFact}
              target={`${formatNumber(kpi.moneyPlan)} ${kpi.moneyUnit || '₽'}`}
              percent={pct(kpi.moneyFact, kpi.moneyPlan)}
              barClass="bg-brand"
              onEdit={() => openMetricEditor('revenue')}
            />
            <KpiMetricCard
              label={kpi.dealsTitle}
              value={kpi.dealsFact}
              target={`${formatNumber(kpi.dealsPlan)} ${kpi.dealsUnit || 'шт'}`}
              percent={pct(kpi.dealsFact, kpi.dealsPlan)}
              barClass="bg-emerald"
              onEdit={() => openMetricEditor('contracts')}
              step={{
                label: 'Быстро добавить +1 договор',
                onClick: () => {
                  incrementDeal();
                  toast.success(`${kpi.dealsTitle}: ${kpi.dealsFact + 1} из ${kpi.dealsPlan} ${kpi.dealsUnit}`);
                },
              }}
            />
            <KpiMetricCard
              label={kpi.touchTitle}
              value={kpi.touchFact}
              target={formatNumber(kpi.touchPlan)}
              percent={pct(kpi.touchFact, kpi.touchPlan)}
              barClass="bg-amber"
              onEdit={() => openMetricEditor('touches')}
              step={{
                label: 'Добавить +1 касание ЛПР за сегодня',
                primary: true,
                onClick: () => {
                  incrementTouch();
                  toast.success(`${kpi.touchTitle}: ${kpi.touchFact + 1} из ${kpi.touchPlan}`);
                },
              }}
            />
          </div>

          {/* Действия */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                downloadBackupZip(useAppStore.getState());
                toast.success('Архив HuntOS-B2B-backup.zip успешно скачан');
              }}
            >
              <Archive size={14} />
              <span className="hidden sm:inline">Скачать ZIP</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setLaunchpadOpen(true)} aria-expanded={launchpadOpen}>
              <LayoutGrid size={14} />
              <span className="hidden md:inline">Панель управления</span>
              <kbd className="hidden rounded border border-white/20 px-1 font-mono text-[10px] lg:inline">⌘K</kbd>
            </Button>
          </div>
        </div>
      </header>

      {/* Launchpad */}
      <Dialog open={launchpadOpen} onClose={() => setLaunchpadOpen(false)} title="Панель управления разделами">
        <nav className="grid gap-2 sm:grid-cols-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.id}
                to={section.path}
                onClick={() => setLaunchpadOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md border p-3 transition-colors',
                    isActive
                      ? 'border-brand/50 bg-brand-soft text-ink-primary'
                      : 'border-subtle bg-surface-input text-ink-secondary hover:border-hover hover:text-ink-primary',
                  )
                }
              >
                <Icon size={18} className="shrink-0 text-brand" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{section.title}</span>
                  <span className="block truncate text-[11px] text-ink-muted">{section.kicker}</span>
                </span>
              </NavLink>
            );
          })}
        </nav>
      </Dialog>

      {/* Быстрое редактирование метрики */}
      <Dialog open={editingMetric !== null} onClose={() => setEditingMetric(null)} title="Изменить метрику плана">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMetric();
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              Текущее значение
            </label>
            <Input
              type="number"
              min={0}
              value={editCurrent}
              onChange={(e) => setEditCurrent(e.target.value)}
              className="tabular-nums"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              План / цель
            </label>
            <Input
              type="number"
              min={1}
              value={editTarget}
              onChange={(e) => setEditTarget(e.target.value)}
              className="tabular-nums"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingMetric(null)}>
              <X size={14} />
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
