/** Режим 2: Боевой спарринг-арена с оценкой ответа 1..100 (legacy trainer-pane-arena) */
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Check, Dices, Mic, ScrollText, Swords, Volume2, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Textarea } from '@/shared/ui/Input';
import { useAppStore } from '@/shared/lib/store';
import { cn } from '@/shared/lib/utils';
import {
  ARENA_CRITERIA,
  dictateOnce,
  evaluateArenaAnswer,
  pickObjection,
  speakObjectionVoice,
  type ArenaEvaluation,
} from '@/features/trainer/model';

const arenaSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, 'Напишите или надиктуйте ответ для оценки от 1 до 100')
    .max(4000, 'Слишком длинный ответ — максимум 4000 символов'),
});

type ArenaFormValues = z.infer<typeof arenaSchema>;

export function ArenaWidget() {
  const objections = useAppStore((s) => s.objections);
  const incrementTouch = useAppStore((s) => s.incrementTouch);

  const [arenaIndex, setArenaIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<ArenaEvaluation | null>(null);
  const [dictating, setDictating] = useState(false);

  const item = pickObjection(objections, arenaIndex);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArenaFormValues>({ resolver: zodResolver(arenaSchema), defaultValues: { answer: '' } });

  const answerValue = watch('answer');

  const scoreTone = useMemo(() => {
    if (!evaluation) return 'neutral' as const;
    if (evaluation.score >= 90) return 'emerald' as const;
    if (evaluation.score >= 60) return 'amber' as const;
    return 'danger' as const;
  }, [evaluation]);

  if (!item) {
    return (
      <Card heading="Спарринг-арена">
        <p className="py-6 text-center text-sm text-ink-muted">
          Нет данных возражений. Загрузите эталонные данные в Настройках.
        </p>
      </Card>
    );
  }

  const contextLabel =
    item.context ||
    `Боевой спарринг (${(arenaIndex % objections.length) + 1} из ${objections.length}) · Роль: ${item.role}`;

  const handleRandomAttack = () => {
    const next = (arenaIndex + 1) % Math.max(1, objections.length);
    setArenaIndex(next);
    setEvaluation(null);
    const nextItem = pickObjection(objections, next);
    if (nextItem) {
      try {
        speakObjectionVoice(nextItem.quote);
        toast('Озвучиваем возражение клиента (SpeechSynthesis)...');
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Озвучка запущена');
      }
    }
  };

  const handleSpeakAttack = () => {
    try {
      speakObjectionVoice(item.quote);
      toast('Озвучиваем возражение клиента (SpeechSynthesis)...');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Озвучка запущена');
    }
  };

  const handleInsertSample = () => {
    setValue('answer', item.sampleAnswer || item.rebuttal || '', { shouldValidate: true });
  };

  const handleDictate = async () => {
    setDictating(true);
    try {
      const transcript = await dictateOnce();
      if (transcript) {
        setValue('answer', `${answerValue ? answerValue + ' ' : ''}${transcript}`.trim(), {
          shouldValidate: true,
        });
        toast('Речь распознана и добавлена в ответ');
      } else {
        toast('Ничего не расслышано — попробуйте ещё раз');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Распознавание речи недоступно');
    } finally {
      setDictating(false);
    }
  };

  const onSubmit = handleSubmit((values) => {
    const result = evaluateArenaAnswer(values.answer);
    setEvaluation(result);
    incrementTouch();
    toast(`Ответ оценён: ${result.score} из 100 баллов`);
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* Атака клиента */}
      <Card
        heading="Арена: атака ЛПР"
        subtitle={contextLabel}
        icon={<Swords size={16} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleSpeakAttack}>
              <Volume2 size={14} /> Озвучить возражение
            </Button>
            <Button variant="primary" size="sm" onClick={handleRandomAttack}>
              <Dices size={14} /> Следующая атака
            </Button>
          </div>
        }
      >
        <div className="rounded-md border border-danger/25 bg-danger-soft/60 p-4">
          <Badge tone="danger">{item.role}</Badge>
          <p className="mt-3 text-lg font-semibold leading-snug text-ink-primary sm:text-xl">{item.quote}</p>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="arena-answer" className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
              Ваш ответ менеджером
            </label>
            <Textarea
              id="arena-answer"
              rows={6}
              placeholder="Сформулируйте перехват: SLA 99.9%, оптический резерв под 1С и кассы, аудит счёта, цена простоя офиса + закрывающий вопрос…"
              invalid={Boolean(errors.answer)}
              {...register('answer')}
            />
            {errors.answer && <p className="mt-1 text-xs text-danger">{errors.answer.message}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" variant="primary">
              <ScrollText size={15} /> Оценить ответ (1–100)
            </Button>
            <Button variant="secondary" size="md" onClick={handleInsertSample}>
              Подставить сильный ответ
            </Button>
            <Button variant="ghost" size="md" onClick={handleDictate} disabled={dictating}>
              <Mic size={15} className={cn(dictating && 'animate-pulse')} />
              {dictating ? 'Слушаю…' : 'Диктовать голосом'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Критерии и вердикт */}
      <Card heading="Критерии тренера" subtitle="4 твёрдых B2B-аргумента" icon={<Check size={16} />}>
        <ul className="space-y-2">
          {ARENA_CRITERIA.map((c, idx) => {
            const flag = evaluation?.flags[idx];
            return (
              <li
                key={c.name}
                className={cn(
                  'flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm',
                  flag === undefined && 'border-subtle bg-surface-input/50 text-ink-secondary',
                  flag === true && 'border-emerald/30 bg-emerald-soft/60 text-emerald-200',
                  flag === false && 'border-amber/30 bg-amber-soft/60 text-amber-200',
                )}
              >
                <span>{c.name}</span>
                <span className="shrink-0 whitespace-nowrap font-mono text-[11px]">
                  {flag === undefined ? '—' : flag ? '+20 б · Засчитано ✓' : '0 б · Не раскрыто ✗'}
                </span>
              </li>
            );
          })}
        </ul>

        {evaluation && (
          <div className="mt-4 space-y-3 border-t border-subtle pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-secondary">Вердикт тренера</span>
              <Badge tone={scoreTone}>Оценка: {evaluation.score} / 100</Badge>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-white/5"
              role="progressbar"
              aria-valuenow={evaluation.score}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  evaluation.score >= 90 ? 'bg-emerald' : evaluation.score >= 60 ? 'bg-amber' : 'bg-danger',
                )}
                style={{ width: `${evaluation.score}%` }}
              />
            </div>
            <p className="text-sm leading-relaxed text-ink-secondary">{evaluation.advice}</p>
          </div>
        )}

        {!evaluation && (
          <p className="mt-4 flex items-center gap-2 border-t border-subtle pt-4 text-xs text-ink-muted">
            <X size={14} /> Напишите ответ и нажмите «Оценить» — тренер разберёт его по 4 аргументам.
          </p>
        )}
      </Card>
    </div>
  );
}
