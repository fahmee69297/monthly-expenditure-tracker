import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useApp } from "../context/AppContext";
import { todayISO } from "../utils/constants";

export default function ExpenseForm({ initialExpense = null, onSaved }) {
  const { categories, addExpense, updateExpense } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      categoryId: "",
      date: todayISO(),
    },
  });

  useEffect(() => {
    reset(
      initialExpense
        ? {
            name: initialExpense.name,
            amount: initialExpense.amount,
            categoryId: initialExpense.categoryId,
            date: initialExpense.date,
          }
        : {
            name: "",
            amount: "",
            categoryId: categories[0]?.id || "",
            date: todayISO(),
          }
    );
  }, [initialExpense, categories, reset]);

  const submit = async (data) => {
    if (initialExpense) {
      await updateExpense(initialExpense.id, data);
    } else {
      await addExpense(data);
    }

    if (!initialExpense) {
      reset({
        name: "",
        amount: "",
        categoryId: categories[0]?.id || "",
        date: todayISO(),
      });
    }

    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="card p-4 sm:p-6">
      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="expense-name">Expense Name</label>
          <input
            id="expense-name"
            className="field"
            placeholder="e.g. Groceries"
            autoComplete="off"
            {...register("name", {
              required: "Expense name is required.",
              maxLength: { value: 100, message: "Keep the name under 100 characters." },
            })}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="expense-amount">Amount</label>
          <div className="flex items-center gap-2">
            <input
              id="expense-amount"
              className="field"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required.",
                valueAsNumber: true,
                validate: (value) => Number.isFinite(value) && value > 0 || "Enter an amount greater than zero.",
              })}
            />
            <span className="flex h-12 shrink-0 items-center rounded-xl bg-panel2 px-3 text-sm font-bold text-cyan">KES</span>
          </div>
          {errors.amount && <p className="mt-1 text-xs text-rose-400">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="expense-category">Category</label>
          <div className="relative">
            <select
              id="expense-category"
              className="field appearance-none pr-12"
              disabled={!categories.length}
              {...register("categoryId", { required: "Choose a category." })}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          </div>
          {errors.categoryId && <p className="mt-1 text-xs text-rose-400">{errors.categoryId.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="expense-date">Date</label>
          <div className="relative">
            <input
              id="expense-date"
              className="field"
              type="date"
              {...register("date", { required: "Date is required." })}
            />
            <CalendarDays className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          </div>
          {errors.date && <p className="mt-1 text-xs text-rose-400">{errors.date.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !categories.length}
          className="primary-btn w-full text-base"
        >
          {isSubmitting ? "Saving…" : initialExpense ? "Update Expense" : "Add Expense"}
        </button>
      </div>
    </form>
  );
}
