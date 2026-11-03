/** Левая карточка экрана Настроек: бренд + метрики плана (legacy form-settings / applySettingsFromForm) */
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/shared/lib/store';
import type { Kpi } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const settingsSchema = z.object({
  companyName: z.string().trim().min(2, 'Минимум 2 символа').max(80, 'Максимум 80 символов'),
  moneyTitle: z.string().trim().min(2, 'Укажите название метрики').max(60, 'Максимум 60 символов'),
  moneyPlan: z.coerce.number({ invalid_type_error: 'Введите число' }).refine((v) => Number.isInteger(v), 'Целое число').refine((v) => v >= 1000 && v <= 100_000_000, 'План выручки: от 1 000 до 100 000 000 ₽'),
  dealsTitle: z.string().trim().min(2, 'Укажите название метрики').max(60, 'Максимум 60 символов'),
  dealsPlan: z.coerce.number({ invalid_type_error: 'Введите число' }).refine((v) => Number.isInteger(v), 'Целое число').refine((v) => v >= 1 && v <= 1000, 'План договоров: от 1 до 1000 шт'),
  touchTitle: z.string().trim().min(2, 'Укажите название метрики').max(60, 'Максимум 60 символов'),
  touchPlan: z.coerce.number({ invalid_type_error: 'Введите число' }).refine((v) => Number.isInteger(v), 'Целое число').refine((v) => v >= 1 && v <= 500, 'Дневная норма касаний: от 1 до 500'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface Snapshot {
  companyName: string;
  moneyTitle: string;
  moneyPlan: number;
  dealsTitle: string;
  dealsPlan: number;
  touchTitle: string;
  touchPlan: number;
}

function takeSnapshot(kpi: Kpi, companyName: string): Snapshot {
  return {
    companyName,
    moneyTitle: kpi.moneyTitle,
    moneyPlan: kpi.moneyPlan,
    dealsTitle: kpi.dealsTitle,
    dealsPlan: kpi.dealsPlan,
    touchTitle: kpi.touchTitle,
    touchPlan: kpi.touchPlan,
  };
}

export function SalesPlanSettingsWidget() {
  const kpi = useAppStore((s) => s.kpi);
  const companyName = useAppStore((s) => s.companyName);
  const setCompanyName = useAppStore((s) => s.setCompanyName);
  const updateKpi = useAppStore((s) => s.updateKpi);

  const snapshot = takeSnapshot(kpi, companyName);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    mode: 'onChange',
    defaultValues: snapshot,
  });

  // Внешнее изменение KPI (быстрое редактирование из шапки / импорт копии) → синхронизация формы
  // (аналог legacy syncSettingsForm). Пока пользователь печатает — не трогаем поля.
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current) reset(snapshot);
  }, [snapshot, reset]);

  // Мгновенное применение правок к шапке при валидном состоянии формы
  // (legacy привязывал 'input' → applySettingsFromForm на каждое поле)
  useEffect(() => {
    const subscription = watch((current, { name }) => {
      if (name) editing.current = true;
      const result = settingsSchema.safeParse(current);
      if (!result.data) return;
      setCompanyName(result.data.companyName.trim());
      updateKpi({
        moneyTitle: result.data.moneyTitle.trim(),
        moneyPlan: result.data.moneyPlan,
        dealsTitle: result.data.dealsTitle.trim(),
        dealsPlan: result.data.dealsPlan,
        touchTitle: result.data.touchTitle.trim(),
        touchPlan: result.data.touchPlan,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setCompanyName, updateKpi]);

  const onSubmit = handleSubmit(() => {
    editing.current = false;
    toast.success('Настройки компании и метрик KPI сохранены');
  });

  const fieldError = (name: keyof SettingsFormValues) =>
    errors[name] ? (
      <span role="alert" className="mt-1 block text-xs text-danger">
        {errors[name]?.message}
      </span>
    ) : null;

  return (
    <Card
      heading="Параметры плана продаж и бренда"
      subtitle="Изменения мгновенно обновляют зафиксированную шапку KPI"
      icon={<SlidersHorizontal size={18} />}
    >
        <form id="form-settings" onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="set-company-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              Название вашей телеком-компании
            </label>
            <Input id="set-company-name" placeholder="Планета B2B" invalid={!!errors.companyName} {...register('companyName')} />
            {fieldError('companyName')}
          </div>

          <div className="h-px bg-subtle" aria-hidden="true" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-label-revenue" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                Название метрики №1
              </label>
              <Input id="set-label-revenue" invalid={!!errors.moneyTitle} {...register('moneyTitle')} />
              {fieldError('moneyTitle')}
            </div>
            <div>
              <label htmlFor="set-target-revenue" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                Плановая сумма (₽)
              </label>
              <Input
                id="set-target-revenue"
                type="number"
                min={1000}
                step={5000}
                className="tabular-nums"
                invalid={!!errors.moneyPlan}
                {...register('moneyPlan')}
              />
              {fieldError('moneyPlan')}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-label-contracts" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                Название метрики №2
              </label>
              <Input id="set-label-contracts" invalid={!!errors.dealsTitle} {...register('dealsTitle')} />
              {fieldError('dealsTitle')}
            </div>
            <div>
              <label htmlFor="set-target-contracts" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                План договоров (шт)
              </label>
              <Input
                id="set-target-contracts"
                type="number"
                min={1}
                step={1}
                className="tabular-nums"
                invalid={!!errors.dealsPlan}
                {...register('dealsPlan')}
              />
              {fieldError('dealsPlan')}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-label-touches" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                Название метрики №3
              </label>
              <Input id="set-label-touches" invalid={!!errors.touchTitle} {...register('touchTitle')} />
              {fieldError('touchTitle')}
            </div>
            <div>
              <label htmlFor="set-target-touches" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                Дневная норма касаний
              </label>
              <Input
                id="set-target-touches"
                type="number"
                min={1}
                step={1}
                className="tabular-nums"
                invalid={!!errors.touchPlan}
                {...register('touchPlan')}
              />
              {fieldError('touchPlan')}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            <Save size={15} />
            Сохранить настройки плана
          </Button>
        </form>
    </Card>
  );
}
