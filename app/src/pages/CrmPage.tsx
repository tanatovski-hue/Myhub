/** Экран CRM: умный импорт + ручное добавление + список клиентов (legacy screen #crm) */
import { SmartImportWidget } from '@/widgets/crm/SmartImportWidget';
import { AddClientWidget } from '@/widgets/crm/AddClientWidget';
import { ClientListWidget } from '@/widgets/crm/ClientListWidget';

export function CrmPage() {
  return (
    <section aria-labelledby="heading-crm">
      <div className="mb-4">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-brand">
          Модуль 02 · CRM и парсер таблиц
        </span>
        <h1 className="mt-1 text-xl font-bold text-ink-primary sm:text-2xl" id="heading-crm">
          База клиентов и Умный импорт
        </h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-start">
        <div className="space-y-4">
          <SmartImportWidget />
          <AddClientWidget />
        </div>
        <ClientListWidget />
      </div>
    </section>
  );
}
