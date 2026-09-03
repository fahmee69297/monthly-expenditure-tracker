import { Wallet } from "lucide-react";

const LoadingScreen = ({ fullScreen = true }) => {
  const className = fullScreen
    ? "flex min-h-screen flex-col items-center justify-center bg-panel"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={className}>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/15 text-accent">
        <Wallet size={40} strokeWidth={2} />
      </div>
      <div className="h-2 w-48 overflow-hidden rounded-full bg-panel2">
        <div className="h-full w-full animate-loading rounded-full bg-accent"></div>
      </div>
      <p className="mt-4 text-sm text-slate-400">Loading your finances...</p>
    </div>
  );
};

export default LoadingScreen;
