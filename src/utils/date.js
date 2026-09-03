import { FILTERS, todayISO } from "./constants";

export const parseISODate = (value) => new Date(`${value}T00:00:00`);

export const formatDate = (value) =>
  parseISODate(value).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const endOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfWeek = (date = new Date()) => {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(0, 0, 0, 0);
  return end;
};

export const dateToISO = (date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

export const getFilterRange = (filter, customStart, customEnd) => {
  const now = new Date();

  if (filter === FILTERS.MONTH) {
    return {
      start: dateToISO(startOfMonth(now)),
      end: dateToISO(endOfMonth(now)),
    };
  }

  if (filter === FILTERS.WEEK) {
    return {
      start: dateToISO(startOfWeek(now)),
      end: dateToISO(endOfWeek(now)),
    };
  }

  if (filter === FILTERS.CUSTOM) {
    return {
      start: customStart || todayISO(),
      end: customEnd || todayISO(),
    };
  }

  return { start: null, end: null };
};

export const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const monthLabel = (date) =>
  date.toLocaleDateString("en-US", { month: "short" });

export const getLast12Months = () => {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: monthKey(d),
      label: d.toLocaleDateString("en-US", { month: "short" }),
      fullLabel: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
};

export const isWithinRange = (date, start, end) =>
  (!start || date >= start) && (!end || date <= end);
