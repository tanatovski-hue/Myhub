/**
 * Умный автономный парсер таблиц (Excel / 1С / Google Таблицы).
 * Полный перенос эвристики legacy parseSmartTable() + zod-валидация результата.
 */
import { z } from 'zod';
import type { Client } from '@/shared/types';
import { cleanPhoneTo7 } from '@/shared/lib/utils';
import { normalizeStatus } from '@/entities/lead/model';

const REGEX_INN = /(\b\d{10}\b|\b\d{12}\b)/;
const REGEX_PHONE = /(\+?[78][-\s(]*\d{3}[-\s)]*\d{3}[-\s]*\d{2}[-\s]*\d{2})/;
const REGEX_LEGAL_ENTITY = /(?:^|[\s"«(])(ООО|ИП|АО|ЗАО|ПАО|НПО|ТД|ГК)(?:[\s».)]|$)/i;

export const clientCreateSchema = z.object({
  company: z.string().trim().min(2, 'Укажите название компании'),
  inn: z
    .string()
    .trim()
    .refine((v) => v === '' || v === '—' || /^\d{10}$|^\d{12}$/.test(v), 'ИНН должен содержать 10 или 12 цифр'),
  phone: z
    .string()
    .trim()
    .refine((v) => cleanPhoneTo7(v).length >= 10, 'Укажите телефон ЛПР в формате +7 (999) 123-45-67'),
  amount: z.coerce.number().min(0, 'Сумма не может быть отрицательной').default(8900),
  status: z.string().default('Новый'),
  comment: z.string().trim().default('Добавлено вручную'),
});

export type ClientCreateValues = z.input<typeof clientCreateSchema>;

export type NewClientData = Omit<Client, 'id'>;

export interface ParseReport {
  added: NewClientData[];
  skippedLines: number;
}

/** Разбор одной строки таблицы по ячейкам — эвристика 1-в-1 из legacy */
function parseLine(line: string): NewClientData | null {
  let delimiter = '\t';
  if (line.includes('\t')) delimiter = '\t';
  else if (line.includes(';')) delimiter = ';';
  else if (line.includes('|')) delimiter = '|';
  else if (line.includes(',')) delimiter = ',';

  const cells = line
    .split(delimiter)
    .map((c) => c.trim().replace(/^["']|["']$/g, '').trim())
    .filter(Boolean);

  if (cells.length === 0) return null;

  let inn = '';
  let phone = '';
  let company = '';
  let amount = 8900;
  const usedIndices = new Set<number>();

  cells.forEach((cell, idx) => {
    if (!inn) {
      const innMatch = cell.match(REGEX_INN);
      if (innMatch) {
        inn = innMatch[1];
        const stripped = cell.replace(/инн/i, '').replace(/\D/g, '');
        if (stripped === inn) {
          usedIndices.add(idx);
          return;
        }
      }
    }

    if (!phone) {
      const phoneMatch = cell.match(REGEX_PHONE);
      if (phoneMatch) {
        phone = cleanPhoneTo7(phoneMatch[1]);
        const strippedPhone = cell.replace(/\D/g, '');
        if (strippedPhone.length >= 10 && strippedPhone.length <= 11) {
          usedIndices.add(idx);
          return;
        }
      }
    }
  });

  // Сумма: число 3–6 знаков после чистки от ₽/руб/р./мес
  cells.forEach((cell, idx) => {
    if (usedIndices.has(idx)) return;
    const cleanPrice = cell.replace(/\s+/g, '').replace(/(₽|руб\.?|р\.?\/мес|р\.?)/gi, '');
    if (/^\d{3,6}$/.test(cleanPrice)) {
      amount = Number(cleanPrice);
      usedIndices.add(idx);
    }
  });

  // Компания: сначала юрлицо-маркер (ООО/ИП/АО...), иначе самая длинная текстовая ячейка
  let companyIdx = -1;
  cells.forEach((cell, idx) => {
    if (usedIndices.has(idx) || companyIdx !== -1) return;
    if (REGEX_LEGAL_ENTITY.test(cell)) {
      company = cell;
      companyIdx = idx;
    }
  });

  if (companyIdx === -1) {
    let longestNoDigits = '';
    let longestAnyText = '';
    let longestNoDigitsIdx = -1;
    let longestAnyTextIdx = -1;

    cells.forEach((cell, idx) => {
      if (usedIndices.has(idx)) return;
      if (!/\d/.test(cell) && cell.length > longestNoDigits.length) {
        longestNoDigits = cell;
        longestNoDigitsIdx = idx;
      }
      if (cell.length > longestAnyText.length) {
        longestAnyText = cell;
        longestAnyTextIdx = idx;
      }
    });

    if (longestNoDigitsIdx !== -1) {
      company = longestNoDigits;
      companyIdx = longestNoDigitsIdx;
    } else if (longestAnyTextIdx !== -1) {
      company = longestAnyText;
      companyIdx = longestAnyTextIdx;
    }
  }

  if (companyIdx !== -1) usedIndices.add(companyIdx);

  const commentParts: string[] = [];
  cells.forEach((cell, idx) => {
    if (!usedIndices.has(idx)) commentParts.push(cell);
  });

  const fallbackCompany = company || 'Корпоративный клиент';
  const fallbackComment = commentParts.join(' · ') || 'Импортировано через умный парсер';

  const parsed = clientCreateSchema.safeParse({
    company: fallbackCompany,
    inn: inn || '—',
    phone,
    amount,
    status: 'Новый',
    comment: fallbackComment,
  });

  // Строки без телефона проходят как «Новый» контакт (как в legacy), но поля нормализуются схемой
  const data = parsed.success
    ? parsed.data
    : {
        company: fallbackCompany,
        inn: inn || '—',
        phone,
        amount: Number(amount) || 8900,
        status: 'Новый',
        comment: fallbackComment,
      };

  return {
    company: data.company,
    inn: data.inn,
    phone: cleanPhoneTo7(String(data.phone)),
    amount: Math.max(0, Number(data.amount) || 8900),
    status: normalizeStatus(data.status),
    comment: data.comment,
    countedInKpi: false,
  };
}

export function parseSmartTable(rawText: string): ParseReport {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const added: NewClientData[] = [];
  let skippedLines = 0;

  lines.forEach((line) => {
    const parsed = parseLine(line);
    if (parsed) added.push(parsed);
    else skippedLines += 1;
  });

  return { added, skippedLines };
}

export const SAMPLE_PASTE =
  '6671190452; +7 (912) 640-55-12; ООО «УралЭнергоСнаб»; г. Екатеринбург, БЦ Клевер Парк, Ткачей 23, нужен 1 Гбит/с + стат IP; 11900\n' +
  'АО «ЕкатеринбургАвтоТранс»\t6658901234\t8-922-209-14-88\tул. Фронтовых Бригад 18, резерв 1С по оптике\t13500';

/** Приветствие для WhatsApp-чата клиента (legacy renderClients) */
export function buildClientGreeting(companyName: string, clientCompany: string): string {
  return `Здравствуйте! Беспокоит ${companyName}. Обращаюсь по вопросу высокоскоростного оптического интернета и резервирования канала для ${clientCompany}. Подскажите, с кем можно кратко согласовать техническую возможность и спецтариф?`;
}

export function buildClientWhatsAppUrl(
  companyName: string,
  cleanPhone: string,
  clientCompany: string,
): string {
  const greetingText = buildClientGreeting(companyName, clientCompany);
  return `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(greetingText)}`;
}
