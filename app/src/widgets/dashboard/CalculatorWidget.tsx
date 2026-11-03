import { useMemo } from 'react';
import { useForm, useWatch, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Building2,
  Calculator as CalculatorIcon,
  Copy,
  MessageCircle,
  RotateCcw,
  Send,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input, Select, Textarea } from '@/shared/ui/Input';
import { useAppStore } from '@/shared/lib/store';
import { cn, formatNumber, openExternalLinkSafe } from '@/shared/lib/utils';
import {
  CALCULATOR_DEFAULTS,
  SPEED_OPTIONS,
  TERM_OPTIONS,
  buildTelegramShareUrl,
  buildWhatsAppShareUrl,
  calculateEconomics,
  calculatorSchema,
  type CalculatorFormValues,
} from '@/features/calculator/model';

const OPTION_CARDS = [
  {
    name: 'hasStaticIp' as const,
    title: 'Статический IP (/30 или /29)',
    badge: 'Включено в КП',
    desc: 'Белый IPv4 для VPN, удалённых складов, видеонаблюдения и 1С',
  },
  {
    name: 'hasBackup1G' as const,
    title: 'Резервный канал 1 Гбит/с',
    badge: 'Независимый ввод',
    desc: 'Второй оптический луч с авто-переключением BGP/VRRP за 50 мс',
  },
  {
    name: 'hasSla999' as const,
    title: 'SLA 99.9% с финансовой гарантией',
    badge: 'Приоритет КС',
    desc: 'Мониторинг узла 24/7, выезд аварийной бригады ВОЛС до 2 часов',
  },
];

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
      {children}
    </label>
  );
}

export function CalculatorWidget() {
  const companyName = useAppStore((s) => s.companyName);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: CALCULATOR_DEFAULTS,
    mode: 'onChange',
  });

  // Реактивный пересчёт при любом изменении полей (аналог legacy updateCalculator на input/change)
  const values = useWatch({ control });
  const result = useMemo(() => {
    const parsed = calculatorSchema.safeParse(values);
    if (!parsed.success) return null;
    return calculateEconomics(
      {
        clientName: parsed.data.clientName.trim(),
        speedMbps: parsed.data.speedMbps,
        currentBill: parsed.data.currentBill,
        ourTariff: parsed.data.ourTariff,
        termMonths: parsed.data.termMonths,
        hasStaticIp: parsed.data.hasStaticIp,
        hasBackup1G: parsed.data.hasBackup1G,
        hasSla999: parsed.data.hasSla999,
      },
      companyName,
    );
  }, [values, companyName]);

  const onSubmit: SubmitHandler<CalculatorFormValues> = () => {
    toast.success('Расчёт КП готов к отправке');
  };

  const copyProposal = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.proposalText);
      toast.success('Расчёт КП скопирован в буфер обмена');
    } catch {
      toast.error('Буфер обмена недоступен в этом браузере');
    }
  };

  const sendToChannel = (channel: 'wa' | 'tg') => {
    if (!result) {
      toast.error('Исправьте ошибки в форме — расчёт не готов');
      return;
    }
    navigator.clipboard?.writeText(result.proposalText).catch(() => undefined);
    if (channel === 'wa') {
      openExternalLinkSafe(buildWhatsAppShareUrl(result.proposalText));
      toast.success('Открыт WhatsApp с готовым расчётом КП');
      return;
    }
    openExternalLinkSafe(buildTelegramShareUrl(result.proposalText));
    toast.success('Открыт Telegram с готовым расчётом КП');
  };

  const resetCalc = () => {
    reset(CALCULATOR_DEFAULTS);
    toast.info('Калькулятор сброшен к базовым параметрам');
  };

  const termMonths = values.termMonths ?? 12;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* ЛЕВАЯ КОЛОНКА — форма параметров */}
      <Card
        heading="Калькулятор выгоды перехода на оптику «Планеты»"
        subtitle="Сравнение текущего провайдера с корпоративным тарифом"
        icon={<CalculatorIcon size={20} />}
        actions={
          <Button variant="secondary" size="sm" onClick={resetCalc}>
            <RotateCcw size={14} />
            <span>Сбросить расчёт</span>
          </Button>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="calc-client-name">Клиент / Офис (опционально)</FieldLabel>
              <div className="relative">
                <Building2
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <Input
                  id="calc-client-name"
                  className="pl-9"
                  placeholder="Например: ООО Технопарк, БЦ Высоцкий"
                  autoComplete="off"
                  invalid={Boolean(errors.clientName)}
                  {...register('clientName')}
                />
              </div>
              {errors.clientName && (
                <p className="mt-1 text-xs text-danger">{errors.clientName.message}</p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="calc-speed-mbps">Скорость канала (Мбит/с)</FieldLabel>
              <Select id="calc-speed-mbps" className="tabular-nums" {...register('speedMbps')}>
                {SPEED_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="calc-current-bill">Текущий счёт клиента (₽/мес)</FieldLabel>
              <div className="relative">
                <Input
                  id="calc-current-bill"
                  type="number"
                  min={0}
                  step={500}
                  required
                  className="tabular-nums pr-14"
                  invalid={Boolean(errors.currentBill)}
                  {...register('currentBill')}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
                  ₽/мес
                </span>
              </div>
              {errors.currentBill && <p className="mt-1 text-xs text-danger">{errors.currentBill.message}</p>}
            </div>

            <div>
              <FieldLabel htmlFor="calc-our-tariff">Наш тариф (₽/мес)</FieldLabel>
              <div className="relative">
                <Input
                  id="calc-our-tariff"
                  type="number"
                  min={0}
                  step={500}
                  required
                  className="tabular-nums pr-14"
                  invalid={Boolean(errors.ourTariff)}
                  {...register('ourTariff')}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
                  ₽/мес
                </span>
              </div>
              {errors.ourTariff && <p className="mt-1 text-xs text-danger">{errors.ourTariff.message}</p>}
            </div>
          </div>

          {/* Сегментированный выбор срока контракта */}
          <div>
            <FieldLabel>Срок фиксации тарифа по договору</FieldLabel>
            <Controller
              name="termMonths"
              control={control}
              render={({ field }) => (
                <div role="radiogroup" aria-label="Срок фиксации тарифа" className="flex gap-2">
                  {TERM_OPTIONS.map((term) => {
                    const active = Number(field.value) === term;
                    return (
                      <button
                        key={term}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => field.onChange(term)}
                        className={cn(
                          'h-10 flex-1 rounded-md border text-sm font-medium transition-colors',
                          active
                            ? 'border-brand bg-brand-soft text-blue-300'
                            : 'border-subtle bg-surface-input text-ink-secondary hover:border-hover hover:text-ink-primary',
                        )}
                      >
                        {term} мес
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Чекбокс-карточки технических опций */}
          <div>
            <FieldLabel>Технические опции и защита бизнеса</FieldLabel>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {OPTION_CARDS.map((opt) => (
                <Controller
                  key={opt.name}
                  name={opt.name}
                  control={control}
                  render={({ field }) => (
                    <label
                      className={cn(
                        'flex cursor-pointer flex-col gap-1.5 rounded-md border p-3 transition-colors',
                        field.value
                          ? 'border-brand/50 bg-brand-soft/60'
                          : 'border-subtle bg-surface-input hover:border-hover',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#2563eb]"
                        />
                        <span className="rounded-full border border-brand/25 bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-blue-300">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-xs font-semibold leading-snug text-ink-primary">{opt.title}</span>
                      <span className="text-[11px] leading-snug text-ink-muted">{opt.desc}</span>
                    </label>
                  )}
                />
              ))}
            </div>
          </div>
        </form>
      </Card>

      {/* ПРАВАЯ КОЛОНКА — sticky-блок результатов */}
      <div className="xl:sticky xl:top-24 xl:self-start">
        <Card
          heading="Расчёт экономии и готовый оффер"
          subtitle="Для мгновенной отправки ЛПР в WhatsApp или Telegram"
          icon={<TrendingDown size={20} className="text-emerald" />}
        >
          <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-md border border-subtle bg-surface-input p-3">
              <span className="block text-[11px] uppercase tracking-wide text-ink-muted">Экономия в месяц</span>
              <strong className="tabular-nums mt-1 block text-xl font-bold text-ink-primary">
                {result ? `${formatNumber(result.monthlyDiff)} ₽` : '—'}
              </strong>
              <span className="tabular-nums mt-0.5 block text-xs text-emerald">
                {result
                  ? result.monthlyDiff > 0
                    ? `-${result.discountPct}% к текущему счёту`
                    : 'Без разницы в абонентской плате'
                  : 'Заполните форму'}
              </span>
            </div>

            <div className="rounded-md border border-emerald/30 bg-emerald-soft p-3">
              <span className="block text-[11px] uppercase tracking-wide text-ink-muted">Экономия за год (12 мес)</span>
              <strong className="tabular-nums mt-1 block text-xl font-bold text-emerald">
                {result ? `${formatNumber(result.yearlySaving)} ₽` : '—'}
              </strong>
              <span className="mt-0.5 block text-xs text-ink-muted">Чистый сохранённый бюджет</span>
            </div>

            <div className="rounded-md border border-subtle bg-surface-input p-3">
              <span className="block text-[11px] uppercase tracking-wide text-ink-muted">
                Выгода за весь срок ({termMonths} мес)
              </span>
              <strong className="tabular-nums mt-1 block text-xl font-bold text-ink-primary">
                {result ? `${formatNumber(result.totalTermSaving)} ₽` : '—'}
              </strong>
              <span className="mt-0.5 block text-xs text-ink-muted">Зафиксировано в договоре</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <FieldLabel htmlFor="calc-proposal-text">Готовый текст КП для WhatsApp / Telegram</FieldLabel>
              <span className="text-[11px] text-ink-muted">
                {result ? `Готово · ${result.proposalText.length} симв.` : 'Ошибка ввода'}
              </span>
            </div>
            <Textarea
              id="calc-proposal-text"
              rows={8}
              readOnly
              aria-label="Готовый текст коммерческого предложения"
              className="font-mono text-xs"
              value={result?.proposalText ?? ''}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={copyProposal} disabled={!result}>
                <Copy size={14} />
                <span>Скопировать расчёт</span>
              </Button>
              <Button variant="whatsapp" size="sm" onClick={() => sendToChannel('wa')} disabled={!result}>
                <Send size={14} />
                <span>В WhatsApp</span>
              </Button>
              <Button variant="telegram" size="sm" onClick={() => sendToChannel('tg')} disabled={!result}>
                <MessageCircle size={14} />
                <span>В Telegram</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
