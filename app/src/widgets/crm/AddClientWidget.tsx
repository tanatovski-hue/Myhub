/** Виджет: ручное добавление клиента (legacy form-add-client) + zod-валидация */
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input, Select, Textarea } from '@/shared/ui/Input';
import { useAppStore } from '@/shared/lib/store';
import { CLIENT_STATUSES } from '@/shared/types';
import { cleanPhoneTo7, formatNumber } from '@/shared/lib/utils';
import { normalizeStatus } from '@/entities/lead/model';
import { clientCreateSchema, type ClientCreateValues } from '@/features/crm/model';

const FORM_DEFAULTS: ClientCreateValues = {
  company: '',
  inn: '',
  phone: '',
  amount: 8900,
  status: 'Новый',
  comment: '',
};

export function AddClientWidget() {
  const addClient = useAppStore((s) => s.addClient);
  const setClientStatus = useAppStore((s) => s.setClientStatus);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ClientCreateValues>({
    resolver: zodResolver(clientCreateSchema),
    defaultValues: FORM_DEFAULTS,
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    const isContract = values.status === '✅ Договор';
    const id = 'c-' + Date.now();
    addClient({
      id,
      company: values.company.trim(),
      inn: values.inn.trim() || '—',
      phone: cleanPhoneTo7(values.phone),
      amount: Number(values.amount) || 8900,
      status: normalizeStatus(values.status ?? 'Новый'),
      comment: (values.comment ?? '').trim() || 'Добавлено вручную',
      countedInKpi: false,
    });
    // единый путь коррекции KPI через store-экшен (легаси: dealsFact/moneyFact при ✅ Договор)
    if (isContract) setClientStatus(id, '✅ Договор');

    toast.success(
      isContract
        ? `Клиент «${values.company}» добавлен со статусом ✅ Договор (+${formatNumber(Number(values.amount) || 8900)} ₽ в план)`
        : `Клиент «${values.company}» добавлен в базу`,
    );
    reset(FORM_DEFAULTS);
  });

  return (
    <Card
      icon={<UserPlus size={16} />}
      heading="Добавить клиента вручную"
      subtitle="Поля с телефоном и компанией обязательны — остальное можно дозаполнить позже"
    >
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <label htmlFor="client-company" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Компания / ИП *
          </label>
          <Input
            id="client-company"
            placeholder="ООО «Пример»"
            invalid={Boolean(errors.company)}
            {...register('company')}
          />
          {errors.company && <p className="mt-1 text-xs text-danger">{errors.company.message}</p>}
        </div>

        <div>
          <label htmlFor="client-inn" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            ИНН (10 или 12 цифр)
          </label>
          <Input id="client-inn" inputMode="numeric" placeholder="6671093421" invalid={Boolean(errors.inn)} {...register('inn')} />
          {errors.inn && <p className="mt-1 text-xs text-danger">{errors.inn.message}</p>}
        </div>

        <div>
          <label htmlFor="client-phone" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Телефон ЛПР *
          </label>
          <Input id="client-phone" inputMode="tel" placeholder="+7 (912) 345-67-89" invalid={Boolean(errors.phone)} {...register('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="client-amount" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Сумма сделки, ₽/мес
          </label>
          <Input id="client-amount" type="number" min={0} step={100} className="tabular-nums" invalid={Boolean(errors.amount)} {...register('amount')} />
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="client-status" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Статус воронки
          </label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select id="client-status" {...field}>
                {CLIENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            )}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="client-comment" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Комментарий (адрес, боли, ЛПР)
          </label>
          <Textarea id="client-comment" rows={2} placeholder="г. Екатеринбург, БЦ Высоцкий. Платят 16 500 ₽, нужен стат. IP" {...register('comment')} />
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
            <UserPlus size={15} />
            Добавить в базу
          </Button>
        </div>
      </form>
    </Card>
  );
}
