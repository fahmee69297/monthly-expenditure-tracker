import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useApp } from "../context/AppContext";
import { todayISO, INCOME_FREQUENCIES } from "../utils/constants";
import { ArrowLeft, Plus } from "lucide-react";

const FREQUENCY_OPTIONS = [
  { value: INCOME_FREQUENCIES.ONE_TIME, label: "One-time" },
  { value: INCOME_FREQUENCIES.DAILY, label: "Daily" },
  { value: INCOME_FREQUENCIES.WEEKLY, label: "Weekly" },
  { value: INCOME_FREQUENCIES.MONTHLY, label: "Monthly" },
];

export default function AddIncome() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    incomeEntries,
    incomeSources,
    addIncome,
    updateIncome,
    addIncomeSource,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [showNewSource, setShowNewSource] = useState(false);
  const [form, setForm] = useState({
    sourceId: "",
    amount: "",
    date: todayISO(),
    description: "",
    frequency: INCOME_FREQUENCIES.ONE_TIME,
  });
  const [newSource, setNewSource] = useState({
    name: "",
    color: "#6366f1",
    icon: "💰",
  });

  const isEditing = !!id;

  // Load income data for editing
  useEffect(() => {
    if (isEditing && incomeEntries.length > 0) {
      const income = incomeEntries.find((item) => item.id === id);
      if (income) {
        setForm({
          sourceId: income.sourceId,
          amount: income.amount.toString(),
          date: income.date,
          description: income.description || "",
          frequency: income.frequency || INCOME_FREQUENCIES.ONE_TIME,
        });
      } else {
        toast.error("Income entry not found.");
        navigate("/income");
      }
    }
  }, [id, incomeEntries, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewSourceChange = (e) => {
    const { name, value } = e.target;
    setNewSource((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.sourceId) {
      toast.error("Please select an income source.");
      return;
    }

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    if (!form.date) {
      toast.error("Please select a date.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateIncome(id, {
          ...form,
          amount,
        });
      } else {
        await addIncome({
          ...form,
          amount,
        });
      }
      navigate("/income");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save income.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewSource = async () => {
    if (!newSource.name.trim()) {
      toast.error("Please enter a source name.");
      return;
    }

    setLoading(true);
    try {
      await addIncomeSource(newSource);
      // Refresh sources list
      setShowNewSource(false);
      setNewSource({ name: "", color: "#6366f1", icon: "💰" });
      toast.success("Income source added!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add income source.");
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = incomeSources || [];

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/income")}
          className="rounded-lg p-2 text-muted transition hover:bg-panel2 hover:text-white"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Edit Income" : "Add Income"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {isEditing
              ? "Update your income entry"
              : "Record a new income source"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 p-5">
        {/* Income Source */}
        <div>
          <label className="label">Income Source</label>
          {!showNewSource ? (
            <div className="flex gap-2">
              <select
                name="sourceId"
                value={form.sourceId}
                onChange={handleChange}
                className="field flex-1"
                required
              >
                <option value="">Select a source...</option>
                {sourceOptions.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.icon} {source.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewSource(true)}
                className="shrink-0 rounded-xl bg-panel2 px-4 text-sm text-accent transition hover:bg-panel"
              >
                <Plus size={18} className="inline" /> New
              </button>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl bg-panel2 p-3">
              <div className="flex gap-2">
                <input
                  name="name"
                  value={newSource.name}
                  onChange={handleNewSourceChange}
                  placeholder="Source name"
                  className="field flex-1"
                />
                <input
                  name="color"
                  type="color"
                  value={newSource.color}
                  onChange={handleNewSourceChange}
                  className="h-12 w-12 cursor-pointer rounded-lg border border-line bg-transparent p-1"
                />
                <input
                  name="icon"
                  value={newSource.icon}
                  onChange={handleNewSourceChange}
                  placeholder="💰"
                  className="field w-16 text-center"
                  maxLength={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddNewSource}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-50"
                >
                  Add Source
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSource(false)}
                  className="rounded-lg border border-line px-4 text-sm text-muted transition hover:bg-panel2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount (KES)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              KES
            </span>
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="field pl-14"
              required
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label">Date</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="field w-full"
            required
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="label">Frequency</label>
          <select
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            className="field w-full"
          >
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            How often do you receive this income?
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description (Optional)</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g., Monthly salary, Freelance project..."
            className="field w-full"
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="primary-btn w-full">
          {loading
            ? isEditing
              ? "Updating..."
              : "Adding..."
            : isEditing
              ? "Update Income"
              : "Add Income"}
        </button>
      </form>
    </div>
  );
}
