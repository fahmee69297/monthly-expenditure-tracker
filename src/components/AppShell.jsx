import { Settings, Tags, CloudOff } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useApp } from "../context/AppContext";

export default function AppShell() {
  const location = useLocation();
  const { firebaseConfigured } = useApp();
  const titles = {
    "/dashboard": "Dashboard",
    "/add": "Add Expense",
    "/expenses": "Expenses",
    "/categories": "Categories",
    "/settings": "Settings",
  };

  return (
    <div className="min-h-screen bg-ink pb-24">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-[#090b12]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[.18em] text-accent">KES Tracker</p>
            <h1 className="text-lg font-bold">{titles[location.pathname] || "Expenditure Tracker"}</h1>
          </div>
          <div className="flex items-center gap-1">
            <Link className="tap flex items-center justify-center rounded-xl text-muted hover:bg-panel2 hover:text-white" to="/categories" aria-label="Categories">
              <Tags size={20} />
            </Link>
            <Link className="tap flex items-center justify-center rounded-xl text-muted hover:bg-panel2 hover:text-white" to="/settings" aria-label="Settings">
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </header>


      {!firebaseConfigured && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
          <div className="mx-auto flex max-w-6xl items-center gap-2 text-xs text-amber-200">
            <CloudOff size={15} className="shrink-0" />
            <span><strong>Demo mode:</strong> Firebase is not configured. Data is saved only in this browser.</span>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
