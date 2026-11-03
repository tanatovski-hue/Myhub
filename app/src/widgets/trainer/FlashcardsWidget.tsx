/** Режим 1: Карточки возражений с таймером 15 секунд (legacy trainer-pane-flashcards) */
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Eye, EyeOff, TimerReset, Volume2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { useAppStore } from '@/shared/lib/store';
import { pickObjection, shiftIndex, speakObjectionVoice } from '@/features/trainer/model';
import { useObjectionTimer } from '@/features/trainer/useObjectionTimer';

export function FlashcardsWidget() {
  const objections = useAppStore((s) => s.objections);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const timer = useObjectionTimer(() => {
    setRevealed(true);
    toast('15 секунд истекли! Проверьте себя по эталонному перехвату.');
  });

  const item = pickObjection(objections, index);

  // Смена карточки — полный сброс состояния (legacy renderObjectionCard)
  useEffect(() => {
    setRevealed(false);
    timer.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!item) {
    return (
      <Card heading="Карточки возражений">
        <p className="py-6 text-center text-sm text-ink-muted">
          Нет данных возражений. Загрузите эталонные данные в Настройках.
        </p>
      </Card>
    );
  }

  const num = String(index % objections.length + 1).padStart(2, '0');
  const tot = String(objections.length).padStart(2, '0');

  const handleSpeak = () => {
    try {
      speakObjectionVoice(item.quote);
      toast('Озвучиваем возражение клиента (SpeechSynthesis)...');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Озвучка запущена');
    }
  };

  return (
    <Card
      heading={
        <>
          Карточка возражения{' '}
          <span className="font-mono text-xs text-ink-muted">Возражение {num} / {tot}</span>
        </>
      }
      icon={<Volume2 size={16} />}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIndex(shiftIndex(objections.length, index, -1))}>
            <ChevronLeft size={14} /> Назад
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIndex(shiftIndex(objections.length, index, 1))}>
            Вперёд <ChevronRight size={14} />
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Таймер */}
        <div className="rounded-md border border-subtle bg-surface-input/60 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              Думай и формулируй за 15 секунд
            </span>
            <div className="flex items-center gap-2">
              <Badge tone={timer.secondsLeft === 0 ? 'danger' : timer.running ? 'amber' : 'brand'}>
                {Math.max(0, timer.secondsLeft)} сек
              </Badge>
              <Button variant="secondary" size="sm" onClick={timer.start}>
                <TimerReset size={14} /> Старт таймера
              </Button>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-1000 ease-linear"
              style={{ width: `${timer.progressPct}%` }}
            />
          </div>
        </div>

        {/* Роль и реплика клиента */}
        <div>
          <Badge tone="danger">{item.role}</Badge>
          <p className="mt-3 text-lg font-semibold leading-snug text-ink-primary sm:text-xl">{item.quote}</p>
          {item.context && <p className="mt-2 text-xs text-ink-muted">{item.context}</p>}
        </div>

        <Button variant="ghost" size="sm" onClick={handleSpeak}>
          <Volume2 size={14} /> Озвучить возражение
        </Button>

        {/* Эталонный перехват */}
        <div>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
          >
            {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
            {revealed ? 'Скрыть эталонный перехват' : 'Показать эталонный перехват'}
          </button>

          {revealed && (
            <div className="mt-3 space-y-3 rounded-md border border-emerald/25 bg-emerald-soft/60 p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-primary">{item.rebuttal}</p>
              <div className="border-t border-emerald/20 pt-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-300">Формула перехвата</span>
                <p className="mt-1 text-sm text-ink-secondary">{item.takeaway}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
