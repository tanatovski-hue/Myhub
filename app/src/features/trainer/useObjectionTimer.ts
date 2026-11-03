/** Хук 15-секундного таймера тренировки (legacy startObjectionTimer/resetObjectionTimer) */
import { useCallback, useEffect, useRef, useState } from 'react';
import { OBJECTION_TIMER_SECONDS } from '@/features/trainer/model';

export interface ObjectionTimerApi {
  secondsLeft: number;
  running: boolean;
  expired: boolean;
  progressPct: number;
  start: () => void;
  reset: () => void;
}

export function useObjectionTimer(onExpire?: () => void): ObjectionTimerApi {
  const [secondsLeft, setSecondsLeft] = useState(OBJECTION_TIMER_SECONDS);
  const [running, setRunning] = useState(false);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expireCbRef = useRef(onExpire);
  expireCbRef.current = onExpire;

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    setRunning(false);
    setExpired(false);
    setSecondsLeft(OBJECTION_TIMER_SECONDS);
  }, [clear]);

  const start = useCallback(() => {
    clear();
    setExpired(false);
    setSecondsLeft(OBJECTION_TIMER_SECONDS);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clear();
          setRunning(false);
          setExpired(true);
          expireCbRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [clear]);

  useEffect(() => clear, [clear]);

  return {
    secondsLeft,
    running,
    expired,
    progressPct: (Math.max(0, secondsLeft) / OBJECTION_TIMER_SECONDS) * 100,
    start,
    reset,
  };
}
