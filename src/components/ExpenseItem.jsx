import { Pencil, Trash2 } from "lucide-react";
import { formatKES } from "../utils/constants";
import { formatDate } from "../utils/date";

export default function ExpenseItem({ expense, category, onEdit, onDelete }) {
  return (
    <article className="card p-4">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-white/5"
          style={{ backgroundColor: category?.color || "#64748b" }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-white">{expense.name}</h3>
              <p className="mt-1 text-xs text-muted">{category?.name || expense.categoryName || "Uncategorized"}</p>
            </div>
            <p className="shrink-0 text-right font-bold text-cyan">{formatKES(expense.amount)}</p>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <time className="text-xs text-muted" dateTime={expense.date}>{formatDate(expense.date)}</time>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="tap flex items-center justify-center rounded-xl text-slate-300 hover:bg-panel2 hover:text-white"
                aria-label={`Edit ${expense.name}`}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(expense)}
                className="tap flex items-center justify-center rounded-xl text-rose-400 hover:bg-rose-500/10"
                aria-label={`Delete ${expense.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
