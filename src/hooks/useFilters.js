// src/hooks/useFilters.js
import { useState, useMemo } from "react";
import { FILTERS, todayISO } from "../utils/constants";
import { getFilterRange } from "../utils/date";

export function useFilters() {
  const [filter, setFilter] = useState(FILTERS.MONTH);
  const [customStart, setCustomStart] = useState(todayISO());
  const [customEnd, setCustomEnd] = useState(todayISO());

  const filterRange = useMemo(
    () => getFilterRange(filter, customStart, customEnd),
    [filter, customStart, customEnd],
  );

  const applyFilter = (items, dateKey = "date") => {
    const { start, end } = filterRange;
    return items.filter((item) => {
      if (start && item[dateKey] < start) return false;
      if (end && item[dateKey] > end) return false;
      return true;
    });
  };

  return {
    filter,
    setFilter,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    filterRange,
    applyFilter,
  };
}
