import { FILTERS } from "../utils/constants";
import { useApp } from "../context/AppContext";

const options = [
  ["all", "All Time"],
  ["month", "This Month"],
  ["week", "This Week"],
  ["custom", "Custom Range"],
];

export default function FilterBar() {
  const {
    filter,
    setFilter,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
  } = useApp();

  return (
    <div className="card p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`min-h-12 rounded-xl px-3 text-sm font-semibold transition ${
              filter === value
                ? "bg-accent text-white"
                : "bg-panel2 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filter === FILTERS.CUSTOM && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label>
            <span className="sr-only">Start date</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="field"
            />
          </label>
          <label>
            <span className="sr-only">End date</span>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="field"
            />
          </label>
        </div>
      )}
    </div>
  );
}
