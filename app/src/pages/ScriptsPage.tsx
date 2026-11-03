/** Экран «База скриптов» (legacy screen #scripts): категории + список + рабочая область/редактор */
import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { ScriptsListWidget } from '@/widgets/scripts/ScriptsListWidget';
import { ScriptWorkspaceWidget } from '@/widgets/scripts/ScriptWorkspaceWidget';
import { useAppStore } from '@/shared/lib/store';
import type { Script } from '@/shared/types';

export function ScriptsPage() {
  const scripts = useAppStore((s) => s.scripts);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeScriptId, setActiveScriptId] = useState<string | null>(scripts[0]?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const filteredIds = useMemo(
    () =>
      (activeCategory === 'all' ? scripts : scripts.filter((sc) => sc.category === activeCategory)).map(
        (sc) => sc.id,
      ),
    [scripts, activeCategory],
  );

  // Если активный скрипт выпал из фильтра — выбираем первый в списке (legacy renderScripts)
  useEffect(() => {
    if (!filteredIds.includes(activeScriptId ?? '')) {
      setActiveScriptId(filteredIds[0] ?? null);
    }
  }, [filteredIds, activeScriptId]);

  const editingDraft: Script | null = useMemo(
    () => scripts.find((sc) => sc.id === activeScriptId) ?? null,
    [scripts, activeScriptId],
  );

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setIsEditing(false);
    setIsNew(false);
  };

  const handleSelectScript = (id: string) => {
    setActiveScriptId(id);
    setIsEditing(false);
    setIsNew(false);
  };

  const handleNewScript = () => {
    setIsEditing(true);
    setIsNew(true);
  };

  const handleEnterEdit = () => {
    if (!editingDraft) return;
    setIsEditing(true);
    setIsNew(false);
  };

  const handleExitEdit = () => {
    setIsEditing(false);
    setIsNew(false);
    if (!isNew && !scripts.some((sc) => sc.id === activeScriptId)) {
      setActiveScriptId(scripts[0]?.id ?? null);
    }
  };

  const handleSaved = (script: Script) => {
    setActiveScriptId(script.id);
    setIsEditing(false);
    setIsNew(false);
    if (activeCategory !== 'all') setActiveCategory(script.category);
  };

  return (
    <section aria-labelledby="heading-scripts">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="block font-mono text-[11px] uppercase tracking-widest text-brand">
            Модуль 03 · Библиотека касаний
          </span>
          <h1 className="mt-1 text-xl font-bold text-ink-primary sm:text-2xl" id="heading-scripts">
            Боевые скрипты 2026
          </h1>
        </div>
        {!isEditing && (
          <Button variant="secondary" size="sm" onClick={handleNewScript}>
            <Plus size={14} />
            + Свой скрипт
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <ScriptsListWidget
          activeCategory={activeCategory}
          activeScriptId={activeScriptId}
          onCategoryChange={handleCategoryChange}
          onSelectScript={handleSelectScript}
        />
        <ScriptWorkspaceWidget
          activeScriptId={activeScriptId}
          isEditing={isEditing}
          isNew={isNew}
          editingDraft={isNew ? null : editingDraft}
          onExitEdit={handleExitEdit}
          onEnterEdit={handleEnterEdit}
          onSaved={handleSaved}
        />
      </div>
    </section>
  );
}
