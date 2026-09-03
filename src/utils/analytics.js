import { getLast12Months, monthKey, monthLabel, parseISODate } from "./date";

export const sumExpenses = (expenses) =>
  expenses.reduce((total, item) => total + Number(item.amount || 0), 0);

export const buildMonthlyData = (expenses, selectedRange) => {
  const months = getLast12Months();

  return months.map((month) => {
    const total = expenses.reduce((sum, expense) => {
      const d = parseISODate(expense.date);
      const key = monthKey(d);
      const inSelectedRange =
        (!selectedRange.start || expense.date >= selectedRange.start) &&
        (!selectedRange.end || expense.date <= selectedRange.end);

      return key === month.key && inSelectedRange
        ? sum + Number(expense.amount || 0)
        : sum;
    }, 0);

    return { ...month, total };
  });
};

export const buildCategoryData = (expenses, categories) => {
  const byCategory = new Map(
    categories.map((category) => [category.id, { name: category.name, color: category.color, value: 0 }])
  );

  expenses.forEach((expense) => {
    const existing = byCategory.get(expense.categoryId);
    if (existing) {
      existing.value += Number(expense.amount || 0);
    } else {
      byCategory.set(expense.categoryId, {
        name: expense.categoryName || "Uncategorized",
        color: "#64748b",
        value: Number(expense.amount || 0),
      });
    }
  });

  return [...byCategory.values()].filter((item) => item.value > 0);
};

export const buildDailyData = (expenses, start, end) => {
  const fallbackStart = start ? new Date(`${start}T00:00:00`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const fallbackEnd = end ? new Date(`${end}T00:00:00`) : new Date();

  const days = [];
  const cursor = new Date(fallbackStart);

  while (cursor <= fallbackEnd && days.length < 366) {
    const iso = [
      cursor.getFullYear(),
      String(cursor.getMonth() + 1).padStart(2, "0"),
      String(cursor.getDate()).padStart(2, "0"),
    ].join("-");

    const total = expenses
      .filter((expense) => expense.date === iso)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    days.push({
      date: iso,
      label: cursor.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      total,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

export const percentageChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

export const getPreviousMonthTotals = (expenses) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const current = expenses
    .filter((e) => parseISODate(e.date) >= currentMonthStart)
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  const previous = expenses
    .filter((e) => {
      const d = parseISODate(e.date);
      return d >= previousMonthStart && d <= previousMonthEnd;
    })
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  return { current, previous };
};

export const monthlyTooltipLabel = (key) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};
