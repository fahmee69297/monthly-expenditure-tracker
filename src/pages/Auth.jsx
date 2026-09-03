import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { Eye, EyeOff, LockKeyhole, Mail, Wallet, X } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../firebase";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const isLogin = mode === "login";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      default:
        return isLogin
          ? "Unable to sign in. Please try again."
          : "Unable to create your account. Please try again.";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    if (!isLogin && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!auth) {
      toast.error("Firebase is not configured. Check your .env file.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Set persistence based on "Remember Me" checkbox
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence,
        );
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Send email verification
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          toast.success("Account created! Please verify your email.");
        }
        toast.success("Account created successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!auth) {
      toast.error("Firebase is not configured.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim().toLowerCase());
      toast.success("Password reset email sent! Check your inbox.");
      setShowResetModal(false);
      setResetEmail("");
    } catch (error) {
      console.error(error);
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No account found with this email.");
          break;
        case "auth/invalid-email":
          toast.error("Please enter a valid email address.");
          break;
        default:
          toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const switchMode = () => {
    setMode((current) => (current === "login" ? "register" : "login"));
    setForm({ email: "", password: "" });
    setShowPassword(false);
    setRememberMe(false);
  };

  return (
    <>
      <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <Wallet size={32} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Monthly Expenditure
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {isLogin
                ? "Sign in to manage your finances."
                : "Create your personal expenditure account."}
            </p>
          </div>

          <section className="card p-5 sm:p-6">
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-panel2 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`min-h-12 rounded-lg px-3 text-sm font-semibold transition ${
                  isLogin
                    ? "bg-accent text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`min-h-12 rounded-lg px-3 text-sm font-semibold transition ${
                  !isLogin
                    ? "bg-accent text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck="false"
                    className="field pl-11"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="field pl-11 pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-1 top-1/2 flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-2 text-xs text-slate-500">
                    Password must contain at least 6 characters.
                  </p>
                )}
              </div>

              {/* Remember Me checkbox - only on login */}
              {isLogin && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-line bg-panel2 text-accent focus:ring-accent"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm text-slate-400"
                  >
                    Remember me
                  </label>
                </div>
              )}

              {/* Forgot Password link - only on login */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-sm text-accent hover:text-violet-400 transition"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="primary-btn w-full"
              >
                {loading
                  ? isLogin
                    ? "Signing in..."
                    : "Creating account..."
                  : isLogin
                    ? "Log In"
                    : "Create Account"}
              </button>
            </form>

            <div className="mt-6 border-t border-line pt-5 text-center">
              <p className="text-sm text-slate-400">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>
              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="mt-2 min-h-12 px-3 text-sm font-semibold text-accent transition hover:text-violet-400 disabled:opacity-50"
              >
                {isLogin ? "Create an account" : "Log in instead"}
              </button>
            </div>
          </section>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Your expenses, categories, and financial data are kept separate from
            other users.
          </p>
        </div>
      </main>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-md rounded-xl bg-panel p-6">
            <button
              onClick={() => {
                setShowResetModal(false);
                setResetEmail("");
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
            >
              <X size={24} />
            </button>

            <h3 className="mb-2 text-xl font-bold text-white">
              Reset Password
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              className="field w-full mb-4"
              disabled={resetLoading}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetEmail("");
                }}
                className="flex-1 rounded-lg border border-line bg-transparent py-2.5 text-sm font-semibold text-slate-400 hover:bg-panel2 transition"
                disabled={resetLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-violet-600 transition disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Send Reset Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
