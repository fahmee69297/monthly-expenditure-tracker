export default function MetricCard({ label, value, hint, tone = "violet" }) {
  const tones = {
    violet: "bg-violet-500/10 text-violet-300",
    cyan: "bg-cyan-500/10 text-cyan-300",
    green: "bg-emerald-500/10 text-emerald-300",
    red: "bg-rose-500/10 text-rose-300",
  };

  return (
    <div className="card min-w-0 p-4">
      <div className={`mb-4 inline-flex rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]}`}>
        {label}
      </div>
      <p className="truncate text-xl font-bold sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
