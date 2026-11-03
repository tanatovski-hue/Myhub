import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { AppStateData, Client, Kpi, Objection, Script } from '@/shared/types';
import { DEFAULT_CLIENTS_EKB, DEFAULT_OBJECTIONS, DEFAULT_SCRIPTS } from '@/entities/lead/data';
import { cleanPhoneTo7, formatNumber } from '@/shared/lib/utils';
import { normalizeStatus, makeClientId } from '@/entities/lead/model';

/** Новый ключ хранилища React-версии */
export const NEW_STORAGE_KEY = 'huntos_b2b_state_v6';
/** Legacy-ключ монолита Vanilla JS — с него выполняется одноразовая миграция */
export const LEGACY_STORAGE_KEY = 'huntos_b2b_state_v5';

const memoryFallback = new Map<string, string>();

/** Storage с фолбэком в память (SSR / приватный режим браузера) */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name) ?? memoryFallback.get(name) ?? null;
    } catch {
      return memoryFallback.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      memoryFallback.set(name, value);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      memoryFallback.delete(name);
    }
  },
};

export function createDefaultState(): AppStateData {
  return {
    companyName: 'Планета B2B — Офисный интернет',
    kpi: {
      moneyFact: 0,
      moneyPlan: 80000,
      moneyTitle: 'План: Выручка / Бонус',
      moneyUnit: '₽',
      dealsFact: 0,
      dealsPlan: 12,
      dealsTitle: 'План: Договоры',
      dealsUnit: 'шт',
      touchFact: 0,
      touchPlan: 20,
      touchTitle: 'Касания ЛПР',
    },
    currentScreen: 'dashboard',
    clients: structuredClone(DEFAULT_CLIENTS_EKB),
    scripts: structuredClone(DEFAULT_SCRIPTS),
    objections: structuredClone(DEFAULT_OBJECTIONS),
  };
}

/** Валидация и санитайзинг данных извне (замена «слпого» JSON.parse legacy-кода) */
function sanitizeState(parsed: Partial<AppStateData>): AppStateData {
  const def = createDefaultState();

  const clients: Client[] =
    Array.isArray(parsed.clients) && parsed.clients.length > 0
      ? parsed.clients.map((c) => ({
          id: String(c?.id ?? makeClientId()),
          company: String(c?.company ?? 'Корпоративный клиент'),
          inn: String(c?.inn ?? '—'),
          phone: cleanPhoneTo7(String(c?.phone ?? '')),
          comment: String(c?.comment ?? ''),
          amount: Math.max(0, Number(c?.amount) || 0),
          status: normalizeStatus(c?.status),
          countedInKpi: Boolean(c?.countedInKpi || normalizeStatus(c?.status) === '✅ Договор'),
        }))
      : def.clients;

  const scripts: Script[] =
    Array.isArray(parsed.scripts) && parsed.scripts.length >= 6 ? parsed.scripts : def.scripts;

  const objections: Objection[] =
    Array.isArray(parsed.objections) && parsed.objections.length >= 6
      ? parsed.objections
      : def.objections;

  return {
    companyName: typeof parsed.companyName === 'string' && parsed.companyName ? parsed.companyName : def.companyName,
    kpi: { ...def.kpi, ...(parsed.kpi ?? {}) },
    currentScreen: parsed.currentScreen ?? def.currentScreen,
    clients,
    scripts,
    objections,
  };
}

/**
 * Миграция с legacy-ключа `huntos_b2b_state_v5`:
 * если новый ключ пуст, читаем старый state, нормализуем и сохраняем под новым.
 */
function migrateFromLegacy(): AppStateData | undefined {
  try {
    const rawNew = safeStorage.getItem(NEW_STORAGE_KEY);
    if (rawNew) return undefined; // уже мигрировано
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!rawLegacy) return undefined;
    const migrated = sanitizeState(JSON.parse(rawLegacy) as Partial<AppStateData>);
    localStorage.setItem(
      NEW_STORAGE_KEY,
      JSON.stringify({ state: migrated, version: 1 }),
    );
    return migrated;
  } catch {
    return undefined;
  }
}

interface AppStore extends AppStateData {
  /** CRUD клиентов */
  addClient: (client: Omit<Client, 'id'> & { id?: string }) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addClientsBulk: (clients: Omit<Client, 'id'>[]) => number;
  /** Смена статуса с автокоррекцией KPI (legacy updateClientStatus) */
  setClientStatus: (id: string, rawStatus: string) => string;
  /** Обновление KPI */
  updateKpi: (patch: Partial<Kpi>) => void;
  incrementTouch: () => void;
  incrementDeal: () => void;
  setCompanyName: (name: string) => void;
  setCurrentScreen: (screen: AppStateData['currentScreen']) => void;
  /** Скрипты */
  updateScript: (id: string, patch: Partial<Script>) => void;
  addScript: (script: Omit<Script, 'id'> & { id?: string }) => void;
  deleteScript: (id: string) => void;
  resetAll: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),

      addClient: (client) =>
        set((s) => ({
          clients: [{ ...client, id: client.id ?? makeClientId(), countedInKpi: false } as Client, ...s.clients],
        })),

      updateClient: (id, patch) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteClient: (id) => set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      addClientsBulk: (newClients) => {
        const withIds = newClients.map((c) => ({ ...c, id: makeClientId() }) as Client);
        set((s) => ({ clients: [...withIds, ...s.clients] }));
        return withIds.length;
      },

      setClientStatus: (id, rawStatus) => {
        const normalized = normalizeStatus(rawStatus);
        const state = get();
        const client = state.clients.find((c) => c.id === id);
        if (!client) return normalized;

        const dealAmount = Math.max(0, Number(client.amount) || 0);
        const kpi = { ...state.kpi };

        if (normalized === '✅ Договор' && !client.countedInKpi) {
          kpi.dealsFact += 1;
          kpi.moneyFact += dealAmount;
        } else if (normalized !== '✅ Договор' && client.countedInKpi) {
          kpi.dealsFact = Math.max(0, kpi.dealsFact - 1);
          kpi.moneyFact = Math.max(0, kpi.moneyFact - dealAmount);
        }

        const countedInKpi = normalized === '✅ Договор';
        set({
          kpi,
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, status: normalized, countedInKpi } : c,
          ),
        });
        return normalized;
      },

      updateKpi: (patch) => set((s) => ({ kpi: { ...s.kpi, ...patch } })),

      incrementTouch: () => set((s) => ({ kpi: { ...s.kpi, touchFact: s.kpi.touchFact + 1 } })),

      incrementDeal: () => set((s) => ({ kpi: { ...s.kpi, dealsFact: s.kpi.dealsFact + 1 } })),

      setCompanyName: (name) => set({ companyName: name }),

      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      updateScript: (id, patch) =>
        set((s) => ({ scripts: s.scripts.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)) })),

      addScript: (script) =>
        set((s) => ({
          scripts: [...s.scripts, { ...script, id: script.id ?? 's-' + Date.now() } as Script],
        })),

      deleteScript: (id) => set((s) => ({ scripts: s.scripts.filter((sc) => sc.id !== id) })),

      resetAll: () => set({ ...createDefaultState() }),
    }),
    {
      name: NEW_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ companyName, kpi, currentScreen, clients, scripts, objections }) => ({
        companyName,
        kpi,
        currentScreen,
        clients,
        scripts,
        objections,
      }),
      migrate: (persisted) => sanitizeState((persisted ?? {}) as Partial<AppStateData>),
    },
  ),
);

// Одноразовая миграция при старте модуля (до первого рендера)
const migrated = migrateFromLegacy();
if (migrated) useAppStore.setState(migrated);

/** Форматирование суммы для тостов (совместимо с legacy showToast) */
export function fmtMoney(val: number): string {
  return formatNumber(val);
}
