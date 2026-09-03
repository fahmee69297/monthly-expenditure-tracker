import { useState } from "react";
import {
  ShieldCheck,
  Trash2,
  LogOut,
  User,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import { useApp } from "../context/AppContext";
import ConfirmDialog from "../components/ConfirmDialog";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Settings() {
  const { user, expenses, clearAllData, firebaseConfigured } = useApp();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);

  const handleClear = async () => {
    setBusy(true);
    try {
      await clearAllData();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear all data.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) {
      toast.error("Firebase is not configured.");
      return;
    }

    setLogoutBusy(true);
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out.");
    } finally {
      setLogoutBusy(false);
    }
  };

  // User profile info
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const email = user?.email || "No email";
  const createdAt = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "Unknown";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <section>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-muted">Manage your account and data.</p>
      </section>

      {/* User Profile Section */}
      <section className="card p-5">
        <h3 className="mb-3 font-bold text-white">Profile</h3>
        <div className="flex items-center gap-4 bg-panel2 p-4 rounded-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
            <User size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{displayName}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Mail size={14} />
                {email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Joined {createdAt}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Session Info */}
      <section className="card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold">
              {firebaseConfigured
                ? "Authenticated session"
                : "Local demo session"}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              {firebaseConfigured
                ? "Your data is securely stored in Firebase and scoped to your account."
                : "Firebase is not configured yet. Your demo data is stored only in this browser until you add the Firebase environment variables."}
            </p>
            <p className="mt-3 break-all text-xs text-slate-500">
              Session UID: {user?.uid}
            </p>
          </div>
        </div>
      </section>

      {/* Logout Button */}
      {firebaseConfigured && (
        <section className="card border-yellow-500/20 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
              <LogOut size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-yellow-300">Sign Out</h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Log out of your account. You'll need to sign in again to access
                your data.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutBusy}
                className="mt-4 min-h-12 w-full rounded-xl bg-yellow-600 px-4 font-semibold text-white transition hover:bg-yellow-500 disabled:opacity-50"
              >
                {logoutBusy ? "Logging out..." : "Log Out"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Clear Data Section */}
      <section className="card border-rose-500/20 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <Trash2 size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-rose-300">Clear All Data</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Permanently delete all {expenses.length} expense
              {expenses.length === 1 ? "" : "s"} from this account. Categories
              are kept.
            </p>
            <button
              type="button"
              disabled={!expenses.length || busy}
              className="mt-4 min-h-12 w-full rounded-xl bg-rose-600 px-4 font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => setOpen(true)}
            >
              Clear All Expenses
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={open}
        title="Clear all expenses?"
        message={`This will permanently delete all ${expenses.length} expense${expenses.length === 1 ? "" : "s"} from Firestore. This action cannot be undone.`}
        confirmLabel="Clear Everything"
        onCancel={() => setOpen(false)}
        onConfirm={handleClear}
        busy={busy}
      />
    </div>
  );
}
