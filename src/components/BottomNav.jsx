import { BarChart3, List, Plus, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/add", label: "Add", icon: Plus },
  { to: "/expenses", label: "Expenses", icon: List },
  { to: "/income", label: "Income", icon: Wallet },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#0d1019]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition ${
                isActive ? "text-accent" : "text-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-12 items-center justify-center rounded-full ${isActive ? "bg-accent/15" : ""}`}
                >
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
