/** Ядерные доменные типы HuntOS (перенесены 1-в-1 из legacy script.js) */

export const CLIENT_STATUSES = ['Новый', 'В работе', 'КП отправлено', 'Отказ', '✅ Договор'] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export interface Client {
  id: string;
  company: string;
  inn: string;
  phone: string;
  comment: string;
  amount: number;
  status: ClientStatus;
  countedInKpi: boolean;
}

export interface Script {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface Objection {
  role: string;
  quote: string;
  rebuttal: string;
  takeaway: string;
  context?: string;
  sampleAnswer?: string;
}

export interface Kpi {
  moneyFact: number;
  moneyPlan: number;
  moneyTitle: string;
  moneyUnit: string;
  dealsFact: number;
  dealsPlan: number;
  dealsTitle: string;
  dealsUnit: string;
  touchFact: number;
  touchPlan: number;
  touchTitle: string;
}

export type ScreenId = 'dashboard' | 'crm' | 'scripts' | 'trainer' | 'settings';

export interface AppStateData {
  companyName: string;
  kpi: Kpi;
  currentScreen: ScreenId;
  clients: Client[];
  scripts: Script[];
  objections: Objection[];
}

export interface CalculatorInput {
  clientName: string;
  speedMbps: number;
  currentBill: number;
  ourTariff: number;
  termMonths: number;
  hasStaticIp: boolean;
  hasBackup1G: boolean;
  hasSla999: boolean;
}

export interface CalculatorResult {
  monthlyDiff: number;
  yearlySaving: number;
  totalTermSaving: number;
  discountPct: string;
  proposalText: string;
}
