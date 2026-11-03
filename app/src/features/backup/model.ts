/** Фича «Резервное копирование»: экспорт/импорт JSON и ZIP-архив без зависимости от CDN (legacy-проблема №4) */
import { zipSync, strToU8 } from 'fflate';
import type { AppStateData } from '@/shared/types';
import { useAppStore } from '@/shared/lib/store';

export function serializeState(state: AppStateData): string {
  const snapshot = {
    app: 'HuntOS-B2B',
    schemaVersion: 6,
    exportedAt: new Date().toISOString(),
    companyName: state.companyName,
    kpi: state.kpi,
    currentScreen: state.currentScreen,
    clients: state.clients,
    scripts: state.scripts,
    objections: state.objections,
  };
  return JSON.stringify(snapshot, null, 2);
}

/** Скачивание Blob на устройстве (без внешних библиотек) */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportJsonFilename(): string {
  return `huntos-state-${new Date().toISOString().slice(0, 10)}.json`;
}

export function downloadStateJson(state: AppStateData): void {
  const blob = new Blob([serializeState(state)], { type: 'application/json' });
  downloadBlob(blob, exportJsonFilename());
}

export async function copyStateJson(state: AppStateData): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(serializeState(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * ZIP с резервной копией. В отличие от legacy downloadProjectZip (window.JSZip из CDN),
 * fflate упаковывается в бандл — работает офлайн и не зависит от порядка загрузки скриптов.
 */
export function downloadBackupZip(state: AppStateData): void {
  const json = serializeState(state);
  const manifest = [
    '# HuntOS-B2B — резервная копия рабочей станции',
    '',
    `- Дата выгрузки: ${new Date().toLocaleString('ru-RU')}`,
    `- Компания: ${state.companyName}`,
    `- Клиентов: ${state.clients.length}`,
    `- Скриптов: ${state.scripts.length}`,
    `- Возражений: ${state.objections.length}`,
    '',
    'Файл backup.json — полный слепок LocalStorage (ключ huntos_b2b_state_v6).',
    'Восстановление: Настройки → «Восстановление из резервной копии» → вставить JSON или загрузить backup.json.',
  ].join('\n');

  const zipped = zipSync({
    'backup.json': strToU8(json),
    'README.txt': strToU8(manifest),
  });
  downloadBlob(new Blob([zipped], { type: 'application/zip' }), 'HuntOS-B2B-backup.zip');
}

/** Разбор строки JSON с приведением к Partial<AppStateData> (store sanitizeState добивает валидацию) */
export function parseBackupJson(raw: string): Partial<AppStateData> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    // Поддержка формата снапшота { companyName, kpi, ... } и legacy { settings: {...}, clients: [...] }
    const source = (parsed.settings && typeof parsed.settings === 'object'
      ? { ...(parsed.settings as Record<string, unknown>), ...parsed }
      : parsed) as Partial<AppStateData>;
    return source;
  } catch {
    return null;
  }
}

/** Импорт: валидация через sanitizer стора + запись состояния */
export function importBackupFromText(raw: string): boolean {
  const parsed = parseBackupJson(raw);
  if (!parsed) return false;
  useAppStore.getState().importState(parsed);
  return true;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
