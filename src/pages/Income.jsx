import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Wallet, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { useApp } from "../context/AppContext";
import { formatKES, INCOME_FREQUENCY_LABELS } from "../utils/constants";
import ConfirmDialog from "../components/ConfirmDialog";
import FilterBar from "../components/FilterBar";

export default function Income() {
  const { incomeEntries, filteredIncome, filteredExpenses, deleteIncome } =
    useApp();
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Calculate total income and savings for the period
  const metrics = useMemo(() => {
    const totalIncome = filteredIncome.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const totalExpenses = filteredExpenses.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const savings = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      savings,
      isPositive: savings >= 0,
    };
  }, [filteredIncome, filteredExpenses]);

  // Group income by month/year
  const groupedIncome = useMemo(() => {
    const groups = {};
    filteredIncome.forEach((income) => {
      const date = new Date(income.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) {
        groups[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          entries: [],
          total: 0,
        };
      }
      groups[key].entries.push(income);
      groups[key].total += income.amount;
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredIncome]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteIncome(deleteId);
      setShowDeleteDialog(false);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete income entry.");
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Income</h2>
          <p className="mt-1 text-sm text-muted">
            Track all your income sources and see your savings
          </p>
        </div>
        <Link
          to="/income/add"
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600"
        >
          <Plus size={18} />
          Add Income
        </Link>
      </div>

      <FilterBar />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-muted">Total Income</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatKES(metrics.totalIncome)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">Total Expenses</p>
          <p className="text-2xl font-bold text-rose-400">
            {formatKES(metrics.totalExpenses)}
          </p>
        </div>
        <div
          className={`card p-4 ${metrics.isPositive ? "border-emerald-500/30" : "border-rose-500/30"}`}
        >
          <p className="text-sm text-muted">Savings This Period</p>
          <p
            className={`text-2xl font-bold ${metrics.isPositive ? "text-emerald-400" : "text-rose-400"}`}
          >
            {formatKES(metrics.savings)}
          </p>
          {metrics.savings >= 0 ? (
            <p className="text-xs text-emerald-400/70">🎉 You're saving!</p>
          ) : (
            <p className="text-xs text-rose-400/70">
              ⚠️ Spending more than earning
            </p>
          )}
        </div>
      </div>

      {/* Income List Grouped by Month */}
      {groupedIncome.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Wallet size={48} className="mb-3 text-muted" />
          <h3 className="text-lg font-semibold">No income entries yet</h3>
          <p className="mt-1 text-sm text-muted">
            Start tracking your income by adding your first entry.
          </p>
          <Link
            to="/income/add"
            className="mt-4 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600"
          >
            Add Income
          </Link>
        </div>
      ) : (
        groupedIncome.map(([key, group]) => (
          <section key={key} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-white">
                {monthNames[group.month - 1]} {group.year}
              </h3>
              <span className="text-sm font-semibold text-emerald-400">
                Total: {formatKES(group.total)}
              </span>
            </div>
            <div className="space-y-2">
              {group.entries.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between rounded-lg bg-panel2 p-3 transition hover:bg-panel"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                      style={{ backgroundColor: `${income.sourceColor}20` }}
                    >
                      {income.sourceIcon || "💰"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {income.sourceName}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(income.date).toLocaleDateString()}
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-muted/30"></span>
                        <span>
                          {INCOME_FREQUENCY_LABELS[income.frequency] ||
                            "One-time"}
                        </span>
                        {income.description && (
                          <>
                            <span className="inline-block h-1 w-1 rounded-full bg-muted/30"></span>
                            <span className="truncate max-w-[120px]">
                              {income.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {formatKES(income.amount)}
                    </span>
                    <div className="flex gap-1">
                      <Link
                        to={`/income/edit/${income.id}`}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-panel hover:text-white"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteId(income.id);
                          setShowDeleteDialog(true);
                        }}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete income entry?"
        message="This will permanently remove this income entry. This action cannot be undone."
        confirmLabel="Delete Income"
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        busy={false}
      />
    </div>
  );
}
