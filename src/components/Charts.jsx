import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatKES } from "../utils/constants";

const tooltipStyle = {
  backgroundColor: "#111521",
  border: "1px solid #252b3b",
  borderRadius: 12,
  color: "#fff",
};

const formatAxis = (value) => `KES ${Math.round(value).toLocaleString("en-KE")}`;

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="card overflow-hidden p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-xs text-muted">{subtitle}</p>
      </div>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}

export function MonthlyBarChart({ data }) {
  return (
    <ChartCard
      title="12-Month Spending"
      subtitle="Total spending by calendar month"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252b3b" vertical={false} />
          <XAxis dataKey="label" stroke="#8f98ad" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            stroke="#8f98ad"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tickFormatter={(v) => Math.round(v).toLocaleString("en-KE")}
            width={44}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [formatKES(value), "Spent"]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ""}
          />
          <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryDonut({ data }) {
  if (!data.length) {
    return (
      <ChartCard title="Category Breakdown" subtitle="Spending by category in the selected filter">
        <div className="flex h-full items-center justify-center text-sm text-muted">No category spending in this range.</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Category Breakdown" subtitle="Spending by category in the selected filter">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="78%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatKES(value), "Spent"]} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, color: "#cbd5e1", paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DailyLineChart({ data }) {
  return (
    <ChartCard title="Daily Spending Trend" subtitle="Daily totals inside the selected filter">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252b3b" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#8f98ad"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#8f98ad"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tickFormatter={formatAxis}
            width={54}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [formatKES(value), "Spent"]}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#22d3ee"
            strokeWidth={3}
            dot={{ r: 3, fill: "#22d3ee", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
