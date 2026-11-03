/** Виджет: список клиентов CRM (legacy renderClients) — React-рендер вместо innerHTML */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Copy, MessageCircle, Search, Trash2, Users } from 'lucide-react';
import { Badge, type BadgeTone } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input, Select } from '@/shared/ui/Input';
import { useAppStore } from '@/shared/lib/store';
import { CLIENT_STATUSES, type ClientStatus } from '@/shared/types';
import { cn, cleanPhoneTo7, formatNumber, formatPhoneReadable } from '@/shared/lib/utils';
import { normalizeStatus, pipelineSum } from '@/entities/lead/model';
import { buildClientWhatsAppUrl } from '@/features/crm/model';

type FilterKey = 'all' | ClientStatus;

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'Новый', label: 'Новый' },
  { key: 'В работе', label: 'В работе' },
  { key: 'КП отправлено', label: 'КП отправлено' },
  { key: 'Отказ', label: 'Отказ' },
  { key: '✅ Договор', label: '✅ Договор' },
];

const STATUS_TONE: Record<ClientStatus, BadgeTone> = {
  Новый: 'brand',
  'В работе': 'amber',
  'КП отправлено': 'neutral',
  Отказ: 'danger',
  '✅ Договор': 'emerald',
};

export function ClientListWidget() {
  const clients = useAppStore((s) => s.clients);
  const companyName = useAppStore((s) => s.companyName);
  const setClientStatus = useAppStore((s) => s.setClientStatus);
  const deleteClient = useAppStore((s) => s.deleteClient);
  const incrementTouch = useAppStore((s) => s.incrementTouch);
  const setSelectedScriptClient = useAppStore((s) => s.setSelectedScriptClient);

  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const totalPipeline = useMemo(() => pipelineSum(clients), [clients]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return clients.filter((c) => {
      const normSt = normalizeStatus(c.status);
      const matchStatus = filter === 'all' || normSt === filter;
      const matchQuery =
        !q ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.inn || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.comment || '').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [clients, filter, query]);

  const copyInn = async (inn: string) => {
    if (!inn || inn === '—') {
      toast.error('У клиента нет ИНН для копирования');
      return;
    }
    try {
      await navigator.clipboard.writeText(inn);
      toast.success(`ИНН ${inn} скопирован в буфер обмена`);
    } catch {
      toast.error('Буфер обмена недоступен в этом браузере');
    }
  };

  const handleStatusChange = (id: string, raw: string) => {
    const normalized = setClientStatus(id, raw);
    const client = useAppStore.getState().clients.find((c) => c.id === id);
    const dealAmount = Math.max(0, Number(client?.amount) || 0);
    if (normalized === '✅ Договор') {
      toast.success(`✅ Договор! В план продаж начислено +1 договор и +${formatNumber(dealAmount)} ₽`);
    } else {
      toast.info(`Статус изменён на «${normalized}»`);
    }
  };

  const handleWhatsapp = (clientPhone: string, clientCompany: string) => {
    incrementTouch();
    toast.success('Открыт чат WhatsApp (+1 касание ЛПР в шапку)');
    const clean = cleanPhoneTo7(clientPhone);
    window.open(buildClientWhatsAppUrl(companyName, clean, clientCompany), '_blank', 'noopener,noreferrer');
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    toast.success('Клиент удалён из базы');
  };

  const handleToScript = (id: string) => {
    // привязка клиента к редактору скриптов через store-экшен
    setSelectedScriptClient(id);
    navigate('/scripts');
  };

  return (
    <Card
      icon={<Users size={16} />}
      heading="База клиентов"
      subtitle="Фильтр по статусу воронки + сквозной поиск по компании, ИНН, телефону и комментарию"
      actions={
        <Badge tone="brand" className="tabular-nums">
          Клиентов: {clients.length} · Пайплайн: {formatNumber(totalPipeline)} ₽
        </Badge>
      }
    >
      <div className="space-y-3">
        {/* Поиск */}
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            id="crm-search-input"
            type="search"
            placeholder="Поиск: компания / ИНН / телефон / город…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Поиск по базе клиентов"
          />
        </div>

        {/* Фильтр-табы (role=tablist как в legacy) */}
        <div role="tablist" aria-label="Фильтр клиентов по статусу" className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((t) => {
            const active = filter === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(t.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'border-brand/50 bg-brand-soft text-blue-300'
                    : 'border-subtle bg-surface-input text-ink-secondary hover:border-hover hover:text-ink-primary',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Список */}
        {filtered.length === 0 ? (
          <p className="rounded-md border border-dashed border-subtle bg-surface-input/60 p-4 text-center text-sm text-ink-secondary">
            По выбранному фильтру клиенты не найдены. Вставьте скопированные строки из таблицы выше или сбросьте фильтр.
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Карточки клиентов">
            {filtered.map((client) => {
              const clean = cleanPhoneTo7(client.phone);
              const readable = formatPhoneReadable(clean);
              const currentSt = normalizeStatus(client.status);
              return (
                <li
                  key={client.id}
                  className="rounded-md border border-subtle bg-surface-elevated p-3 transition-colors hover:border-hover"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-ink-primary">{client.company}</span>
                        <Badge tone={STATUS_TONE[currentSt]}>{currentSt}</Badge>
                        <button
                          type="button"
                          onClick={() => copyInn(client.inn)}
                          title="Нажмите, чтобы скопировать ИНН в 1 клик"
                          aria-label={`Скопировать ИНН ${client.inn || ''}`}
                          className="inline-flex items-center gap-1 rounded border border-subtle bg-surface-input px-2 py-0.5 font-mono text-[11px] tabular-nums text-ink-secondary transition-colors hover:border-hover hover:text-ink-primary"
                        >
                          <Copy size={11} />
                          ИНН: {client.inn || '—'}
                        </button>
                        {clean ? (
                          <a
                            href={`tel:+${clean}`}
                            className="font-mono text-[11px] tabular-nums text-blue-300 hover:underline"
                            title="Позвонить клиенту"
                          >
                            {readable}
                          </a>
                        ) : (
                          <span className="text-[11px] text-ink-muted">Телефон не указан</span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-secondary">
                        {client.comment || 'Без комментария'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <span className="rounded border border-subtle bg-surface-input px-2 py-1 font-mono text-xs tabular-nums text-emerald-300">
                        {formatNumber(client.amount)} ₽/мес
                      </span>
                      <Select
                        aria-label={`Статус клиента ${client.company}`}
                        className="h-8 w-auto min-w-[130px] py-1 text-xs"
                        value={currentSt}
                        onChange={(e) => handleStatusChange(client.id, e.target.value)}
                      >
                        {CLIENT_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </Select>
                      <Button variant="whatsapp" size="sm" onClick={() => handleWhatsapp(client.phone, client.company)}>
                        <MessageCircle size={13} />
                        WhatsApp
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleToScript(client.id)}>
                        Скрипт
                      </Button>
                      <Button
                        variant="ghostDanger"
                        size="icon"
                        aria-label={`Удалить клиента ${client.company}`}
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
