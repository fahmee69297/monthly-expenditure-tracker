import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, Wallet } from "lucide-react";
import FilterBar from "../components/FilterBar";
import MetricCard from "../components/MetricCard";
import LoadingScreen from "../components/LoadingScreen";
import {
  CategoryDonut,
  DailyLineChart,
  MonthlyBarChart,
} from "../components/Charts";
import { useApp } from "../context/AppContext";
import { formatKES } from "../utils/constants";
import {
  buildCategoryData,
  buildDailyData,
  buildMonthlyData,
  percentageChange,
  getPreviousMonthTotals,
  sumExpenses,
} from "../utils/analytics";
import { parseISODate } from "../utils/date";

export default function Dashboard() {
  const {
    dataLoading,
    filteredExpenses,
    filteredIncome,
    expenses,
    categories,
    filterRange,
    incomeEntries,
  } = useApp();

  const metrics = useMemo(() => {
    const total = sumExpenses(filteredExpenses);
    const { current, previous } = getPreviousMonthTotals(expenses);
    const change = percentageChange(current, previous);

    const rangeStart = filterRange.start
      ? parseISODate(filterRange.start)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const rangeEnd = filterRange.end
      ? parseISODate(filterRange.end)
      : new Date();
    const dayCount = Math.max(
      1,
      Math.floor((rangeEnd - rangeStart) / 86400000) + 1,
    );

    // Calculate income and savings
    const totalIncome = filteredIncome.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const totalExpenses = total;
    const savings = totalIncome - totalExpenses;

    return {
      total,
      average: total / dayCount,
      change,
      totalIncome,
      savings,
      isSaving: savings >= 0,
    };
  }, [filteredExpenses, filteredIncome, expenses, filterRange]);

  const monthlyData = useMemo(
    () => buildMonthlyData(expenses, filterRange),
    [expenses, filterRange],
  );

  const categoryData = useMemo(
    () => buildCategoryData(filteredExpenses, categories),
    [filteredExpenses, categories],
  );

  const dailyData = useMemo(
    () => buildDailyData(filteredExpenses, filterRange.start, filterRange.end),
    [filteredExpenses, filterRange],
  );

  if (dataLoading) return <LoadingScreen />;

  const changeTone =
    metrics.change > 0 ? "red" : metrics.change < 0 ? "green" : "cyan";
  const ChangeIcon =
    metrics.change > 0
      ? ArrowUpRight
      : metrics.change < 0
        ? ArrowDownRight
        : Minus;

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-2xl font-bold">Your spending</h2>
        <p className="mt-1 text-sm text-muted">
          See where your money is going at a glance.
        </p>
      </section>

      <FilterBar />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Total Spent This Period"
          value={formatKES(metrics.total)}
          hint="Based on the selected filter"
          tone="violet"
        />
        <MetricCard
          label="Average Daily Spend"
          value={formatKES(metrics.average)}
          hint="For the selected date range"
          tone="cyan"
        />
        <div className="card min-w-0 p-4">
          <div
            className={`mb-4 inline-flex rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${changeTone === "red" ? "bg-rose-500/10 text-rose-300" : changeTone === "green" ? "bg-emerald-500/10 text-emerald-300" : "bg-cyan-500/10 text-cyan-300"}`}
          >
            Comparison to Last Month
          </div>
          <div className="flex items-center gap-2">
            <ChangeIcon
              size={22}
              className={
                changeTone === "red"
                  ? "text-rose-400"
                  : changeTone === "green"
                    ? "text-emerald-400"
                    : "text-cyan-400"
              }
            />
            <p className="truncate text-xl font-bold sm:text-2xl">
              {Math.abs(metrics.change).toFixed(1)}%
            </p>
          </div>
          <p className="mt-1 text-xs text-muted">
            {metrics.change > 0
              ? "Increase"
              : metrics.change < 0
                ? "Decrease"
                : "No change"}{" "}
            vs previous month
          </p>
        </div>
      </section>

      {/* Savings Card */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-muted">Total Income</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatKES(metrics.totalIncome)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">Total Expenses</p>
          <p className="text-2xl font-bold text-rose-400">
            {formatKES(metrics.total)}
          </p>
        </div>
        <div
          className={`card p-4 ${metrics.isSaving ? "border-emerald-500/30" : "border-rose-500/30"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Monthly Savings</p>
              <p
                className={`text-2xl font-bold ${metrics.isSaving ? "text-emerald-400" : "text-rose-400"}`}
              >
                {formatKES(metrics.savings)}
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${metrics.isSaving ? "bg-emerald-500/10" : "bg-rose-500/10"}`}
            >
              <Wallet
                size={24}
                className={
                  metrics.isSaving ? "text-emerald-400" : "text-rose-400"
                }
              />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Income: {formatKES(metrics.totalIncome)}</span>
            <span>Expenses: {formatKES(metrics.total)}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <MonthlyBarChart data={monthlyData} />
        <CategoryDonut data={categoryData} />
        <div className="lg:col-span-2">
          <DailyLineChart data={dailyData} />
        </div>
      </div>
    </div>
  );
}
