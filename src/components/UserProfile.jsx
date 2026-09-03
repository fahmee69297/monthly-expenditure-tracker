import { User, Mail, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";

const UserProfile = () => {
  const { user } = useApp();

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const email = user.email || "No email";
  const createdAt = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "Unknown";

  return (
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
  );
};

export default UserProfile;
