import { z } from 'zod';
import type { CalculatorInput, CalculatorResult } from '@/shared/types';
import { formatNumber } from '@/shared/lib/utils';

/** Схема валидации калькулятора (заменяет отсутствовавшую в legacy) */
export const calculatorSchema = z.object({
  clientName: z.string().trim().max(120, 'Не более 120 символов'),
  speedMbps: z.coerce.number().int('Только целая скорость').min(10).max(10000),
  currentBill: z.coerce
    .number({ invalid_type_error: 'Введите число' })
    .min(0, 'Счёт не может быть отрицательным')
    .max(10_000_000, 'Слишком большая сумма'),
  ourTariff: z.coerce
    .number({ invalid_type_error: 'Введите число' })
    .min(0, 'Тариф не может быть отрицательным')
    .max(10_000_000, 'Слишком большая сумма'),
  termMonths: z.coerce.number().int().refine((v) => [12, 24, 36].includes(v), 'Срок: 12, 24 или 36 мес'),
  hasStaticIp: z.boolean(),
  hasBackup1G: z.boolean(),
  hasSla999: z.boolean(),
});

export type CalculatorFormValues = z.infer<typeof calculatorSchema>;

export const CALCULATOR_DEFAULTS: CalculatorFormValues = {
  clientName: '',
  speedMbps: 1000,
  currentBill: 14500,
  ourTariff: 8900,
  termMonths: 12,
  hasStaticIp: true,
  hasBackup1G: true,
  hasSla999: true,
};

export const SPEED_OPTIONS = [
  { value: 100, label: '100 Мбит/с · Офисный стандарт' },
  { value: 300, label: '300 Мбит/с · Бизнес Оптимум' },
  { value: 500, label: '500 Мбит/с · Корпоративный' },
  { value: 1000, label: '1000 Мбит/с (1 Гбит/с) · Флагман Оптика' },
] as const;

export const TERM_OPTIONS = [12, 24, 36] as const;

/** Чистая доменная функция расчёта — 1-в-1 формулы legacy updateCalculator() */
export function calculateEconomics(input: CalculatorInput, companyName: string): CalculatorResult {
  const monthlyDiff = Math.max(0, input.currentBill - input.ourTariff);
  const yearlySaving = monthlyDiff * 12;
  const totalTermSaving = monthlyDiff * input.termMonths;
  const discountPct = input.currentBill > 0 ? ((monthlyDiff / input.currentBill) * 100).toFixed(1) : '0.0';

  const includedOptions: string[] = [];
  if (input.hasStaticIp) includedOptions.push('• Белый статический IPv4 (/30) — 0 ₽');
  if (input.hasBackup1G) includedOptions.push('• Независимый резервный оптический канал до 1 Гбит/с');
  if (input.hasSla999) includedOptions.push('• Приоритетный SLA 99.9% (выезд бригады ВОЛС до 2 часов)');

  const headerLine = input.clientName
    ? `Коммерческий расчёт для ${input.clientName} от «${companyName}»:`
    : `Коммерческий расчёт перевода на оптику от «${companyName}»:`;

  const messageLines: string[] = [
    headerLine,
    '',
    `• Текущий счёт: ${formatNumber(input.currentBill)} ₽/мес`,
    `• Наш спецтариф (${input.speedMbps} Мбит/с): ${formatNumber(input.ourTariff)} ₽/мес (фиксация цены на ${input.termMonths} мес)`,
    `• Экономия за 12 мес: ${formatNumber(yearlySaving)} ₽ | Выгода за ${input.termMonths} мес: ${formatNumber(totalTermSaving)} ₽`,
  ];

  if (includedOptions.length > 0) {
    messageLines.push('', 'Включено в КП без доплат:', ...includedOptions);
  }

  messageLines.push(
    '',
    'Готовы забронировать оптический порт и согласовать бесплатное переключение без простоя офиса?',
  );

  return {
    monthlyDiff,
    yearlySaving,
    totalTermSaving,
    discountPct,
    proposalText: messageLines.join('\n'),
  };
}

/** Ссылки шаринга готового КП (legacy shareOrSendProposal) */
export function buildWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function buildTelegramShareUrl(text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent('https://planeta.tc')}&text=${encodeURIComponent(text)}`;
}
