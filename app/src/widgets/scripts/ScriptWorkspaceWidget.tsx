/** Виджет: рабочая область скрипта — просмотр с интерполяцией + редактор (legacy script-view-pane / form-script-editor) */
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Check, Copy, FileText, Pencil, Save, Send, Trash2, UserCheck, X } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input, Select, Textarea } from '@/shared/ui/Input';
import { useAppStore } from '@/shared/lib/store';
import type { Script } from '@/shared/types';
import { copyTextToClipboard, sendScriptToWhatsApp } from '@/features/scripts/model';
import {
  DEFAULT_SCRIPT_CATEGORY,
  NEW_SCRIPT_DRAFT_CONTENT,
  SCRIPT_TOKENS,
  collectCategories,
  interpolateScriptContent,
} from '@/entities/script/model';

const scriptSchema = z.object({
  title: z.string().trim().min(3, 'Название минимум 3 символа').max(160, 'Название слишком длинное'),
  category: z.string().trim().min(1, 'Выберите категорию'),
  content: z.string().trim().min(10, 'Текст скрипта минимум 10 символов'),
});

type ScriptFormValues = z.infer<typeof scriptSchema>;

export interface ScriptWorkspaceWidgetProps {
  activeScriptId: string | null;
  isEditing: boolean;
  isNew: boolean;
  editingDraft: Script | null;
  onExitEdit: () => void;
  onEnterEdit: () => void;
  onSaved: (script: Script) => void;
}

export function ScriptWorkspaceWidget({
  activeScriptId,
  isEditing,
  isNew,
  editingDraft,
  onExitEdit,
  onEnterEdit,
  onSaved,
}: ScriptWorkspaceWidgetProps) {
  const scripts = useAppStore((s) => s.scripts);
  const clients = useAppStore((s) => s.clients);
  const companyName = useAppStore((s) => s.companyName);
  const selectedScriptClientId = useAppStore((s) => s.selectedScriptClientId);
  const setSelectedScriptClient = useAppStore((s) => s.setSelectedScriptClient);
  const addScript = useAppStore((s) => s.addScript);
  const updateScript = useAppStore((s) => s.updateScript);
  const deleteScript = useAppStore((s) => s.deleteScript);
  const incrementTouch = useAppStore((s) => s.incrementTouch);

  const activeScript = useMemo(
    () => scripts.find((sc) => sc.id === activeScriptId) ?? scripts[0] ?? null,
    [scripts, activeScriptId],
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedScriptClientId) ?? null,
    [clients, selectedScriptClientId],
  );

  const finalBody = useMemo(() => {
    if (!activeScript) return '';
    return interpolateScriptContent(activeScript.content, selectedClient, companyName);
  }, [activeScript, selectedClient, companyName]);

  const categories = useMemo(() => collectCategories(scripts), [scripts]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScriptFormValues>({
    resolver: zodResolver(scriptSchema),
    defaultValues: {
      title: '',
      category: DEFAULT_SCRIPT_CATEGORY,
      content: NEW_SCRIPT_DRAFT_CONTENT,
    },
  });

  // Заполнение/сброс формы при входе в режим редактирования (как в legacy)
  useEffect(() => {
    if (!isEditing) return;
    if (editingDraft) {
      reset({ title: editingDraft.title, category: editingDraft.category, content: editingDraft.content });
    } else {
      reset({ title: '', category: DEFAULT_SCRIPT_CATEGORY, content: NEW_SCRIPT_DRAFT_CONTENT });
    }
  }, [isEditing, editingDraft, reset]);

  const copyActive = async () => {
    if (!finalBody) return;
    const ok = await copyTextToClipboard(finalBody);
    toast(ok ? 'Скрипт скопирован в буфер обмена' : 'Буфер обмена недоступен в этом браузере');
  };

  const sendWa = () => {
    if (!finalBody) return;
    void copyTextToClipboard(finalBody);
    incrementTouch();
    sendScriptToWhatsApp(finalBody, selectedClient);
    toast(
      selectedClient
        ? `Открыт WhatsApp для «${selectedClient.company}» (+1 касание ЛПР)`
        : 'Открыт WhatsApp с подставленным текстом скрипта (+1 касание ЛПР)',
    );
  };

  const removeActive = () => {
    if (!activeScript || scripts.length <= 1) return;
    deleteScript(activeScript.id);
    onExitEdit();
    toast('Скрипт удалён');
  };

  const onSubmit = (values: ScriptFormValues) => {
    if (isNew || !activeScript) {
      const created: Script = { id: 's-' + Date.now(), ...values };
      addScript(created);
      onSaved(created);
    } else {
      updateScript(activeScript.id, values);
      onSaved({ ...activeScript, ...values });
    }
    toast('Скрипт сохранён');
  };

  /* ------------------------------ Режим редактора ------------------------------ */
  if (isEditing) {
    return (
      <Card
        heading={isNew ? 'Новый боевой скрипт' : 'Редактирование скрипта'}
        subtitle="Доступны переменные автозаполнения"
        icon={<Pencil size={16} />}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="edit-script-title" className="text-xs font-medium text-ink-secondary">
                Название скрипта *
              </label>
              <Input
                id="edit-script-title"
                placeholder="Например: Выход на ИТ-директора через аварию"
                invalid={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-script-category" className="text-xs font-medium text-ink-secondary">
                Категория
              </label>
              <Select id="edit-script-category" {...register('category')}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-script-content" className="text-xs font-medium text-ink-secondary">
              Текст скрипта (используйте {SCRIPT_TOKENS.join(', ')})
            </label>
            <Textarea
              id="edit-script-content"
              rows={7}
              placeholder="Введите боевой сценарий разговора или сообщения..."
              invalid={Boolean(errors.content)}
              {...register('content')}
            />
            {errors.content && <p className="text-xs text-danger">{errors.content.message}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-subtle pt-4">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onExitEdit}>
                <X size={14} />
                Отмена
              </Button>
              {!isNew && scripts.length > 1 && (
                <Button variant="ghostDanger" onClick={removeActive}>
                  <Trash2 size={14} />
                  Удалить
                </Button>
              )}
            </div>
            <Button type="submit">
              <Save size={14} />
              Сохранить скрипт
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  /* ------------------------------ Режим просмотра ------------------------------ */
  if (!activeScript) {
    return (
      <Card heading="Рабочая область скрипта" icon={<FileText size={16} />}>
        <p className="py-8 text-center text-sm text-ink-muted">Скриптов нет. Создайте первый скрипт.</p>
      </Card>
    );
  }

  return (
    <Card
      heading="Рабочая область скрипта"
      subtitle="Автоподстановка данных клиента"
      icon={<UserCheck size={16} />}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={() => void copyActive()}>
            <Copy size={14} />
            Копировать
          </Button>
          <Button variant="whatsapp" size="sm" onClick={sendWa}>
            <Send size={14} />
            Отправить в WhatsApp
          </Button>
        </>
      }
    >
      {/* Выбор клиента из базы */}
      <div className="space-y-1.5">
        <label htmlFor="script-client-select" className="text-xs font-medium text-ink-secondary">
          Подставить клиента из базы (автозаполнение переменных)
        </label>
        <Select
          id="script-client-select"
          value={selectedScriptClientId ?? ''}
          onChange={(e) => setSelectedScriptClient(e.target.value || null)}
        >
          <option value="">— Без привязки к клиенту (универсальный шаблон) —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company} (ИНН {c.inn} · {new Intl.NumberFormat('ru-RU').format(c.amount)} ₽)
            </option>
          ))}
        </Select>
      </div>

      {/* Мета-панель активного скрипта */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Badge tone="brand">{activeScript.category}</Badge>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-ink-primary sm:text-base">
            {activeScript.title}
          </h3>
        </div>
        <Button variant="secondary" size="sm" onClick={onEnterEdit}>
          <Pencil size={14} />
          Редактировать
        </Button>
      </div>

      <p className="mt-2 font-mono text-[11px] text-ink-muted">
        Переменные:{' '}
        {SCRIPT_TOKENS.map((t) => (
          <code key={t} className="mr-1 rounded bg-white/5 px-1 py-0.5">
            {t}
          </code>
        ))}
      </p>

      {/* Тело скрипта перерисовывается декларативно — баг устаревшего innerHTML/Lucide исключён */}
      <pre
        tabIndex={0}
        className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-md border border-subtle bg-surface-input p-4 font-sans text-sm leading-relaxed text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        {finalBody}
      </pre>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-subtle pt-4 text-xs text-ink-muted">
        <Check size={12} className="text-emerald" />
        {selectedClient ? `Данные подставлены для «${selectedClient.company}»` : 'Универсальный шаблон'}
      </div>
    </Card>
  );
}
