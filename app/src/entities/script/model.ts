/** Модель сущности «Боевой скрипт»: категории, токены, интерполяция (legacy script.js) */
import type { Client, Script } from '@/shared/types';
import { formatNumber } from '@/shared/lib/utils';

export interface ScriptCategoryMeta {
  key: string;
  icon: 'layers' | 'message-square-plus' | 'shield-alert' | 'server-crash' | 'flame';
}

export const SCRIPT_CATEGORIES: ScriptCategoryMeta[] = [
  { key: 'Холодный заход в WA', icon: 'message-square-plus' },
  { key: 'Проход секретаря', icon: 'shield-alert' },
  { key: 'Резервный ввод 1С', icon: 'server-crash' },
  { key: 'Дожим КП', icon: 'flame' },
];

export const DEFAULT_SCRIPT_CATEGORY = 'Холодный заход в WA';

export const SCRIPT_TOKENS = ['{КОМПАНИЯ}', '{ИНН}', '{СУММА}', '{МОЯ_КОМПАНИЯ}'] as const;

export const NEW_SCRIPT_DRAFT_CONTENT =
  'Здравствуйте! Пишу для {КОМПАНИЯ} (ИНН {ИНН}) от оператора «{МОЯ_КОМПАНИЯ}». Спецтариф на оптику — {СУММА} ₽/мес...';

/** Интерполяция переменных по выбранному клиенту (legacy interpolateScriptContent) */
export function interpolateScriptContent(
  rawTemplate: string,
  client: Client | null,
  companyName: string,
): string {
  const companyVal = client?.company ? client.company : 'вашей компании';
  const innVal = client?.inn && client.inn !== '—' ? client.inn : 'ваш ИНН';
  const amountVal = client?.amount ? formatNumber(client.amount) : '8 900';

  return String(rawTemplate ?? '')
    .split('{КОМПАНИЯ}').join(companyVal)
    .split('{ИНН}').join(innVal)
    .split('{СУММА}').join(amountVal)
    .split('{МОЯ_КОМПАНИЯ}').join(companyName);
}

/** Категория + все существующие категории пользовательских скриптов (для select редактора) */
export function collectCategories(scripts: Script[]): string[] {
  const set = new Set<string>(SCRIPT_CATEGORIES.map((c) => c.key));
  scripts.forEach((s) => s.category && set.add(s.category));
  return [...set];
}
