import { ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ title = "No expenses yet", text = "Add your first expense to start tracking your spending." }) {
  return (
    <div className="card flex flex-col items-center px-5 py-12 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent">
        <ReceiptText size={38} strokeWidth={1.6} />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-muted">{text}</p>
      <Link to="/add" className="primary-btn mt-6 inline-flex items-center justify-center">
        Add Expense
      </Link>
    </div>
  );
}
