import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { useApp } from "../context/AppContext";
import { toast } from "react-toastify";
import { Mail, X } from "lucide-react";

const EmailVerificationBanner = () => {
  const { user } = useApp();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.emailVerified || user.demoMode || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (!auth?.currentUser) return;

    setSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send verification email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative mb-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 text-yellow-500/50 hover:text-yellow-500 transition"
      >
        <X size={20} />
      </button>

      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 text-yellow-500" size={20} />
        <div className="flex-1">
          <p className="text-sm text-yellow-200">
            Please verify your email address to access all features.
          </p>
          <button
            onClick={handleResend}
            disabled={sending}
            className="mt-2 text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition disabled:opacity-50"
          >
            {sending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
