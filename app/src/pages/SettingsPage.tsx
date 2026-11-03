/** Экран «⚙️ Настройки» (legacy screen #settings): план продаж + управление локальной базой */
import { Archive } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/shared/lib/store';
import { Button } from '@/shared/ui/Button';
import { SalesPlanSettingsWidget } from '@/widgets/settings/SalesPlanSettingsWidget';
import { DataManagementWidget } from '@/widgets/settings/DataManagementWidget';
import { downloadBackupZip } from '@/features/backup/model';

export function SettingsPage() {
  const state = useAppStore();

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="block font-mono text-[11px] uppercase tracking-widest text-brand">
            Модуль 05 · Персонализация KPI-шапки и резервное копирование
          </span>
          <h1 className="mt-1 text-xl font-bold text-ink-primary sm:text-2xl">Настройки рабочей станции</h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          title="Скачать ZIP резервной копии"
          onClick={() => {
            downloadBackupZip(state);
            toast.success('Архив HuntOS-B2B-backup.zip успешно скачан');
          }}
        >
          <Archive size={14} />
          Скачать ZIP
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SalesPlanSettingsWidget />
        <DataManagementWidget />
      </div>
    </section>
  );
}
