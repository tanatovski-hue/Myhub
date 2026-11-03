import type { Client, ClientStatus } from '@/shared/types';
import { CLIENT_STATUSES } from '@/shared/types';

/** Нормализация статуса по legacy-карте (англ. ключи парсера + русские значения) */
const STATUS_MAP: Record<string, ClientStatus> = {
  new: 'Новый',
  lpr: 'В работе',
  kp: 'КП отправлено',
  rejected: 'Отказ',
  contract: '✅ Договор',
  won: '✅ Договор',
  Новый: 'Новый',
  'В работе': 'В работе',
  'КП отправлено': 'КП отправлено',
  Отказ: 'Отказ',
  '✅ Договор': '✅ Договор',
};

export function normalizeStatus(rawStatus: string | undefined): ClientStatus {
  if (!rawStatus) return 'Новый';
  return STATUS_MAP[rawStatus] ?? 'Новый';
}

export function isDealStatus(status: string): boolean {
  return normalizeStatus(status) === '✅ Договор';
}

export function makeClientId(): string {
  return 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

export function pipelineSum(clients: Client[]): number {
  return clients.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
}

export { CLIENT_STATUSES };
