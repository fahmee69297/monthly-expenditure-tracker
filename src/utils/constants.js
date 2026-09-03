export const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#f97316" },
  { name: "Transport", color: "#22d3ee" },
  { name: "Rent", color: "#8b5cf6" },
  { name: "Utilities", color: "#eab308" },
  { name: "Entertainment", color: "#ec4899" },
  { name: "Shopping", color: "#3b82f6" },
  { name: "Healthcare", color: "#ef4444" },
  { name: "Education", color: "#14b8a6" },
  { name: "Insurance", color: "#6366f1" },
  { name: "Savings", color: "#22c55e" },
];

// Default income sources (users can add their own)
export const DEFAULT_INCOME_SOURCES = [
  { name: "Salary", color: "#22c55e", icon: "💼" },
  { name: "Freelance", color: "#3b82f6", icon: "💻" },
  { name: "Investments", color: "#8b5cf6", icon: "📈" },
  { name: "Rental", color: "#f97316", icon: "🏠" },
  { name: "Business", color: "#ec4899", icon: "🏪" },
  { name: "Gifts", color: "#eab308", icon: "🎁" },
  { name: "Refunds", color: "#14b8a6", icon: "↩️" },
  { name: "Other", color: "#6366f1", icon: "💰" },
];

export const INCOME_FREQUENCIES = {
  ONE_TIME: "one-time",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};

export const INCOME_FREQUENCY_LABELS = {
  [INCOME_FREQUENCIES.ONE_TIME]: "One-time",
  [INCOME_FREQUENCIES.DAILY]: "Daily",
  [INCOME_FREQUENCIES.WEEKLY]: "Weekly",
  [INCOME_FREQUENCIES.MONTHLY]: "Monthly",
};

export const FILTERS = {
  ALL: "all",
  MONTH: "month",
  WEEK: "week",
  CUSTOM: "custom",
};

export const todayISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

export const formatKES = (value) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatCompactKES = (value) =>
  new Intl.NumberFormat("en-KE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
