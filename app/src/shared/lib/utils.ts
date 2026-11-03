import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Конфликтующие tailwind-классы решаются через tailwind-merge */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** ru-RU формат чисел с обычным пробелом (как в legacy formatNumber) */
export function formatNumber(val: number): string {
  const n = Number(val) || 0;
  return n.toLocaleString('ru-RU').replace(/\u00A0/g, ' ');
}

/** Приведение телефона к формату 7XXXXXXXXXX (legacy cleanPhoneTo7) */
export function cleanPhoneTo7(rawPhone: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11 && (digits.startsWith('8') || digits.startsWith('7'))) {
    return '7' + digits.slice(1);
  }
  if (digits.length === 10) {
    return '7' + digits;
  }
  return digits;
}

/** Человекочитаемый телефон +7 (XXX) XXX-XX-XX (legacy formatPhoneReadable) */
export function formatPhoneReadable(phone7: string): string {
  const clean = cleanPhoneTo7(phone7);
  if (clean.length === 11 && clean.startsWith('7')) {
    return `+7 (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7, 9)}-${clean.slice(9, 11)}`;
  }
  return phone7 || '—';
}

/** Безопасное открытие внешней ссылки (legacy openExternalLinkSafe) */
export function openExternalLinkSafe(url: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
