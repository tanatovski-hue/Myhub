/** Логика модуля «Базы скриптов»: копирование, WhatsApp-отправка, URL-сборка */
import type { Client } from '@/shared/types';
import { cleanPhoneTo7, openExternalLinkSafe } from '@/shared/lib/utils';

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** api.whatsapp.com с подставленным текстом; при наличии телефона клиента — чат с ним (legacy btn-wa-script) */
export function buildScriptWhatsAppUrl(text: string, client: Client | null): string {
  const phone = client ? cleanPhoneTo7(client.phone) : '';
  const encoded = encodeURIComponent(text);
  return phone
    ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}

export function sendScriptToWhatsApp(text: string, client: Client | null): void {
  openExternalLinkSafe(buildScriptWhatsAppUrl(text, client));
}
