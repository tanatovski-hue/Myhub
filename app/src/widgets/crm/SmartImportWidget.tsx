/** Виджет: умный импорт строк из таблиц (legacy parseSmartTable + form crm-raw-paste) */
import { useState } from 'react';
import { toast } from 'sonner';
import { ClipboardPaste, ScanLine, Wand2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Textarea } from '@/shared/ui/Input';
import { useAppStore } from '@/shared/lib/store';
import { SAMPLE_PASTE, parseSmartTable } from '@/features/crm/model';

export function SmartImportWidget() {
  const addClientsBulk = useAppStore((s) => s.addClientsBulk);
  const [raw, setRaw] = useState('');

  const handleParse = () => {
    if (!raw.trim()) {
      toast.error('Вставьте скопированные строки из Excel, 1С или Google Таблиц');
      return;
    }
    const { added, skippedLines } = parseSmartTable(raw);
    if (added.length === 0) {
      toast.error('Парсер не нашёл ни одной распознанной строки');
      return;
    }
    const count = addClientsBulk(added);
    setRaw('');
    toast.success(`Умный парсер: добавлено клиентов в базу — ${count}${skippedLines ? ` · пропущено строк: ${skippedLines}` : ''}`);
  };

  return (
    <Card
      icon={<ScanLine size={16} />}
      heading="Умный автономный парсер таблиц"
      subtitle="Вставьте строки из Excel / 1С / Google Таблиц — ИНН, телефон, сумма и компания распознаются автоматически"
    >
      <div className="space-y-3">
        <Textarea
          id="crm-raw-paste"
          rows={5}
          spellCheck={false}
          aria-label="Исходные строки таблицы для импорта"
          placeholder={'6671190452; +7 (912) 640-55-12; ООО «Ромашка»; адрес объекта; 11900'}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="font-mono text-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={handleParse}>
            <ClipboardPaste size={14} />
            Распознать и добавить
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setRaw(SAMPLE_PASTE)}>
            <Wand2 size={14} />
            Пример для теста
          </Button>
        </div>
      </div>
    </Card>
  );
}
