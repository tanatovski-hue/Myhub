import { CalculatorWidget } from '@/widgets/dashboard/CalculatorWidget';

export function DashboardPage() {
  return (
    <section aria-labelledby="heading-dashboard">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="block font-mono text-[11px] uppercase tracking-widest text-brand">
            Модуль 01 · Расчёт ТЭО и окупаемости
          </span>
          <h1 className="mt-1 text-xl font-bold text-ink-primary sm:text-2xl" id="heading-dashboard">
            Дашборд и Калькулятор КП
          </h1>
        </div>
      </div>

      <CalculatorWidget />
    </section>
  );
}
