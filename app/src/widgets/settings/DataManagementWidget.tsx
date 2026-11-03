/** Правая карточка экрана Настроек: JSON-экспорт, ZIP без CDN, импорт с валидацией, заводской сброс */
import { useRef, useState } from 'react';
import { Archive, ClipboardCopy, Database, Download, FolderOpen, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/shared/lib/store';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Input';
import { Dialog } from '@/shared/ui/Dialog';
import {
  copyStateJson,
  downloadBackupZip,
  downloadStateJson,
  importBackupFromFile,
  importBackupFromText,
  serializeState,
} from '@/features/backup/model';

export function DataManagementWidget() {
  // Подписка на весь state для снапшота бэкапа — осознанно (экспорт читает все разделы)
  const state = useAppStore();
  const resetAll = useAppStore((s) => s.resetAll);
  const importState = useAppStore((s) => s.importState);

  const [importText, setImportText] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    downloadStateJson(state);
    toast.success('Резервная копия JSON скачана');
  };

  const handleCopyJson = async () => {
    const json = serializeState(state);
    const ok = await copyStateJson(state);
    setImportText(json);
    toast[ok ? 'success' : 'error'](ok ? 'JSON состояния скопирован в буфер' : 'Буфер обмена недоступен в этом браузере');
  };

  const handleDownloadZip = () => {
    try {
      downloadBackupZip(state);
      toast.success('Архив HuntOS-B2B-backup.zip успешно скачан');
    } catch {
      toast.error('Не удалось сформировать ZIP-архив');
    }
  };

  const applyImport = (raw: string, sourceLabel: string): boolean => {
    if (!raw.trim()) {
      toast.error('Вставьте JSON для восстановления');
      return false;
    }
    if (importBackupFromText(raw)) {
      toast.success(`Состояние восстановлено ${sourceLabel}`);
      return true;
    }
    toast.error('Ошибка: неверный формат JSON');
    return false;
  };

  const handleImportText = () => {
    if (applyImport(importText, 'из текста')) setImportText('');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      // .json читается как текст, .zip распаковывается локально (fflate, без CDN)
      const ok = await importBackupFromFile(file);
      toast[ok ? 'success' : 'error'](
        ok ? `Состояние восстановлено из файла ${file.name}` : 'Ошибка: не удалось разобрать файл (нужен JSON или ZIP с backup.json)',
      );
    } catch {
      toast.error('Ошибка чтения файла');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleFactoryReset = () => {
    localStorage.removeItem('huntos_b2b_state_v6');
    resetAll();
    // legacy resetAll не трогал демо-базу; здесь полный возврат к эталонному состоянию
    importState({});
    setResetOpen(false);
    toast.success('Данные сброшены (загружены 4 компании Екатеринбурга, 6 скриптов и 6 возражений)');
  };

  return (
    <Card
      heading="Управление локальной базой данных (JSON и ZIP)"
      subtitle="Вся база клиентов, скрипты и резервные копии доступны автономно"
      icon={<Database size={18} />}
    >
      <div className="space-y-5">
        {/* Экспорт */}
        <section aria-labelledby="heading-export">
          <h3 id="heading-export" className="text-sm font-semibold text-ink-primary">
            Резервная копия базы (Экспорт JSON и ZIP)
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
            Скачайте полный слепок базы в <code className="rounded bg-white/5 px-1 font-mono">.json</code> или выгрузите
            автономный архив <code className="rounded bg-white/5 px-1 font-mono">HuntOS-B2B-backup.zip</code>. ZIP формируется
            локально (fflate) — без зависимости от CDN.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={handleExportJson}>
              <Download size={14} />
              Скачать базу JSON
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void handleCopyJson()}>
              <ClipboardCopy size={14} />
              Скопировать JSON
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownloadZip} title="Скачать ZIP резервной копии">
              <Archive size={14} />
              Скачать ZIP
            </Button>
          </div>
        </section>

        <div className="h-px bg-subtle" aria-hidden="true" />

        {/* Импорт */}
        <section aria-labelledby="heading-import">
          <h3 id="heading-import" className="text-sm font-semibold text-ink-primary">
            Восстановление из резервной копии (Импорт JSON)
          </h3>
          <label htmlFor="import-json-textarea" className="sr-only">
            JSON данные для импорта
          </label>
          <Textarea
            id="import-json-textarea"
            rows={3}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Вставьте содержимое резервной копии {"clients":[...]} или загрузите файл'
            className="font-mono text-xs"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleImportText}>
              <Upload size={14} />
              Импортировать из текста
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <FolderOpen size={14} />
              Загрузить .json файл
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.zip,application/json,application/zip"
              className="hidden"
              aria-label="Файл резервной копии JSON"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </div>
        </section>

        <div className="h-px bg-subtle" aria-hidden="true" />

        {/* Danger zone */}
        <section aria-labelledby="heading-danger" className="rounded-md border border-danger/30 bg-danger-soft p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 id="heading-danger" className="text-sm font-semibold text-danger">
                Сброс данных до заводского состояния
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                Очистить текущие показатели и вернуть эталонный демо-набор корпоративных клиентов и скриптов «Планета B2B».
              </p>
            </div>
            <Button variant="ghostDanger" size="sm" onClick={() => setResetOpen(true)}>
              <Trash2 size={14} />
              Сбросить все данные
            </Button>
          </div>
        </section>
      </div>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title="Подтвердите сброс">
        <p className="text-sm text-ink-secondary">
          Все клиенты, скрипты, показатели KPI и настройки будут заменены эталонным демо-набором. Действие необратимо —
          предварительно выгрузите резервную копию.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setResetOpen(false)}>
            Отмена
          </Button>
          <Button
            className="bg-danger text-white hover:brightness-110 border-transparent"
            onClick={() => {
              downloadStateJson(state);
              handleFactoryReset();
            }}
          >
            <Trash2 size={14} />
            Скопировать и сбросить
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
