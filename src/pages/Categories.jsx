import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useApp } from "../context/AppContext";
import ConfirmDialog from "../components/ConfirmDialog";

function CategoryForm({ initial, onDone }) {
  const { addCategory, updateCategory } = useApp();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initial || { name: "", color: "#8b5cf6" },
  });

  const submit = async (data) => {
    try {
      if (initial) await updateCategory(initial.id, data);
      else await addCategory(data);
      reset({ name: "", color: "#8b5cf6" });
      onDone();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Could not save category.");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="card p-4">
      <div className="grid grid-cols-[1fr_64px] gap-3">
        <div>
          <label className="label" htmlFor="category-name">Category name</label>
          <input
            id="category-name"
            className="field"
            placeholder="e.g. Personal Care"
            {...register("name", {
              required: "Category name is required.",
              maxLength: { value: 50, message: "Keep it under 50 characters." },
            })}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="category-color">Color</label>
          <input
            id="category-color"
            type="color"
            className="h-12 w-full cursor-pointer rounded-xl border border-line bg-panel2 p-1"
            {...register("color", { required: true })}
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="submit" disabled={isSubmitting} className="primary-btn">
          {isSubmitting ? "Saving…" : initial ? "Update" : "Add Category"}
        </button>
        <button type="button" className="ghost-btn" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

export default function Categories() {
  const { categories, deleteCategory } = useApp();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteCategory(deleting.id);
      setDeleting(null);
    } catch (error) {
      toast.error(error.message || "Could not delete category.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <section className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="mt-1 text-sm text-muted">Customize the categories used by your expenses.</p>
        </div>
        {!adding && !editing && (
          <button type="button" className="primary-btn inline-flex items-center justify-center gap-2 px-4 text-sm" onClick={() => setAdding(true)}>
            <Plus size={18} /> Add
          </button>
        )}
      </section>

      {(adding || editing) && (
        <CategoryForm
          initial={editing}
          onDone={() => { setAdding(false); setEditing(null); }}
        />
      )}

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="card flex min-h-16 items-center gap-3 p-3">
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
            <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>
            <button
              type="button"
              className="tap flex items-center justify-center rounded-xl text-muted hover:bg-panel2 hover:text-white"
              onClick={() => { setAdding(false); setEditing(category); }}
              aria-label={`Edit ${category.name}`}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              className="tap flex items-center justify-center rounded-xl text-rose-400 hover:bg-rose-500/10"
              onClick={() => setDeleting(category)}
              aria-label={`Delete ${category.name}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category?"
        message={deleting ? `Delete "${deleting.name}"? Categories used by an expense cannot be deleted until those expenses are removed or reassigned.` : ""}
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        busy={busy}
      />
    </div>
  );
}
