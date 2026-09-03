import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm";
import { useApp } from "../context/AppContext";

export default function AddExpense() {
  const navigate = useNavigate();
  const { categories } = useApp();
  const [key, setKey] = useState(0);

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Add Expense</h2>
        <p className="mt-1 text-sm text-muted">Record a purchase in a few taps.</p>
      </div>

      {!categories.length ? (
        <div className="card p-5">
          <p className="text-sm text-muted">Create a category before adding an expense.</p>
        </div>
      ) : (
        <ExpenseForm key={key} onSaved={() => { setKey((v) => v + 1); navigate("/expenses"); }} />
      )}
    </div>
  );
}
