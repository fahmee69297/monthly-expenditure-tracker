import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import FilterBar from "../components/FilterBar";
import ExpenseItem from "../components/ExpenseItem";
import ExpenseForm from "../components/ExpenseForm";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { useApp } from "../context/AppContext";
import { formatKES } from "../utils/constants";

export default function Expenses() {
  const {
    dataLoading,
    filteredExpenses,
    categories,
    deleteExpense,
  } = useApp();

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  if (dataLoading) return <LoadingScreen />;

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteExpense(deleting.id);
      setDeleting(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete expense.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <FilterBar />

      {editing && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Edit Expense</h2>
              <p className="text-xs text-muted">Update the selected transaction.</p>
            </div>
            <button type="button" className="ghost-btn" onClick={() => setEditing(null)}>Cancel</button>
          </div>
          <ExpenseForm initialExpense={editing} onSaved={() => setEditing(null)} />
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Transactions</h2>
          <p className="mt-1 text-xs text-muted">
            {filteredExpenses.length} expense{filteredExpenses.length === 1 ? "" : "s"} · {formatKES(filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0))}
          </p>
        </div>
        <Link to="/add" className="primary-btn inline-flex items-center justify-center gap-2 px-4 text-sm">
          <Plus size={18} />
          Add
        </Link>
      </div>

      {filteredExpenses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              category={categories.find((category) => category.id === expense.categoryId)}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete expense?"
        message={deleting ? `Delete "${deleting.name}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        busy={busy}
      />
    </div>
  );
}
