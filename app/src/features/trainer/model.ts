/** Логика тренажёра возражений: SpeechSynthesis, SpeechRecognition, таймер 15с, оценка 1..100 (legacy script.js, модуль 7) */
import type { Objection } from '@/shared/types';

export const OBJECTION_TIMER_SECONDS = 15;

/** Четыре твёрдых B2B-аргумента (подписи критериев из legacy ensureArenaVoiceControlsAndCriteria) */
export const ARENA_CRITERIA: { name: string; missingHint: string }[] = [
  { name: '1. Финансовый SLA 99.9% и время реакции бригады', missingHint: 'финансовый SLA 99.9% (выезд бригады за 2 часа)' },
  { name: '2. Оптический резерв под кассы, 1С и статический IP', missingHint: 'независимый оптический резерв под 1С и кассы' },
  { name: '3. Аудит счёта и снижение тарифа на 15–20% (в ₽)', missingHint: 'бесплатный аудит текущего счёта с экономией 15–20%' },
  { name: '4. Цена простоя офиса + закрытие на следующий шаг', missingHint: 'цену часа простоя офиса и закрывающий вопрос на WhatsApp/ИНН' },
];

export interface ArenaEvaluation {
  score: number;
  flags: boolean[];
  advice: string;
}

/** Оценка ответа пользователя от 1 до 100 баллов по наличию 4 твёрдых аргументов (legacy evaluateArenaAnswer) */
export function evaluateArenaAnswer(text: string): ArenaEvaluation {
  const raw = String(text || '').trim();
  const lower = raw.toLowerCase();

  const hasSla = /sla|99\.9|гарант|штраф|бригад|реакц|2\s*час|регламент/.test(lower);
  const hasBackup = /резерв|второй\s+(канал|ввод|луч)|оптик|волокн|bgp|vrrp|1с|касс|роутер|ip/.test(lower);
  const hasBillAudit = /аудит|счёт|счет|тариф|индексац|эконом|дешевл|15%|20%|переплат|смет|расчёт|расчет|₽|руб/.test(lower);
  const hasDowntimeRisk = /простой|авари|обрыв|встан|потер|убыт|инн|whatsapp|ватсап|провер|порт|\?/.test(lower);

  let score = 10;
  if (raw.length >= 40) score += 6;
  if (raw.length >= 90) score += 4;
  if (hasSla) score += 20;
  if (hasBackup) score += 20;
  if (hasBillAudit) score += 20;
  if (hasDowntimeRisk) score += 20;

  score = Math.max(1, Math.min(100, score));

  const flags = [hasSla, hasBackup, hasBillAudit, hasDowntimeRisk];
  const missing = ARENA_CRITERIA.filter((_, idx) => !flags[idx]).map((c) => c.missingHint);

  let advice: string;
  if (score >= 90) {
    advice = `Блестящий перехват (${score}/100)! Вы использовали все 4 твёрдых B2B-аргумента: финансовый SLA 99.9%, оптический резерв для 1С/касс, аудит текущего счёта и защиту от простоя офиса с чётким закрытием на следующий шаг.`;
  } else if (score >= 60) {
    advice = `Хороший рабочий ответ (${score}/100). Чтобы дожать скептичного ЛПР до 100 баллов, добавьте в аргументацию: ${missing.join(', ')}.`;
  } else {
    advice = `Слабая позиция (${score}/100) — клиент легко уйдёт от разговора. Обязательно включите твёрдые аргументы: ${missing.join(', ')}.`;
  }

  return { score, flags, advice };
}

/** Озвучка возражения через SpeechSynthesis (legacy speakObjectionVoice) */
export function speakObjectionVoice(rawQuote: string): void {
  const cleanText = String(rawQuote || '').replace(/[«»"]/g, '');
  if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
    throw new Error(`Голосовой синтезатор браузера недоступен: ${cleanText}`);
  }

  window.speechSynthesis.cancel();
  const utterance = new window.SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ru-RU';
  utterance.rate = 1.02;
  utterance.pitch = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const ruVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ru'));
  if (ruVoice) utterance.voice = ruVoice;

  window.speechSynthesis.speak(utterance);
}

/* ---------- SpeechRecognition (Web Speech API) ---------- */

interface WebkitSpeechRecognitionResult {
  readonly length: number;
  [index: number]: { transcript: string };
}

interface WebkitSpeechRecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: WebkitSpeechRecognitionResult };
}

interface WebkitSpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: WebkitSpeechRecognitionEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

type WebkitSpeechRecognitionCtor = new () => WebkitSpeechRecognitionInstance;

function getSpeechRecognitionCtor(): WebkitSpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: WebkitSpeechRecognitionCtor;
    webkitSpeechRecognition?: WebkitSpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Доступно ли распознавание речи в текущем браузере */
export function isVoiceInputSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

/** Разовое диктование ru-RU: промис с текстом или ошибкой (legacy btn-voice-input) */
export function dictateOnce(): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      reject(new Error('Распознавание речи недоступно в этом браузере — введите ответ текстом или нажмите «Подставить сильный ответ»'));
      return;
    }
    const rec = new Ctor();
    rec.lang = 'ru-RU';
    rec.interimResults = false;
    rec.continuous = false;

    let finalTranscript = '';
    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        finalTranscript += event.results[i][0].transcript;
      }
    };
    rec.onerror = () => reject(new Error('Не удалось распознать речь — проверьте микрофон и разрешения браузера'));
    rec.onend = () => resolve(finalTranscript.trim());

    try {
      rec.start();
    } catch {
      reject(new Error('Распознавание речи уже запущено'));
    }
  });
}

/** Индекс следующего возрастания со смещением (циклический with wrap-around) */
export function shiftIndex(length: number, current: number, delta: number): number {
  if (length <= 0) return 0;
  return ((current + delta) % length + length) % length;
}

export function pickObjection(list: Objection[], index: number): Objection | null {
  if (list.length === 0) return null;
  return list[((index % list.length) + list.length) % list.length] ?? null;
}
