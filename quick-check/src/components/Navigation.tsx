import { Home, Zap, Target, User, Bell } from "lucide-react";
import type { BetNotification } from "../hooks/useNotifications";

export default function Navigation({
  screen,
  setScreen,
  notifications = [],
  onApproveNotif,
  onRejectNotif,
}: {
  screen: string;
  setScreen: (s: string) => void;
  notifications?: BetNotification[];
  onApproveNotif?: (id: string) => void;
  onRejectNotif?: (id: string) => void;
}) {
  // Hide navbar on login / choose screens
  if (["login", "choose"].includes(screen)) return null;

  const items = [
    { id: "home", label: "Home", icon: <Home size={18} /> },
    { id: "quests", label: "Quests", icon: <Zap size={18} /> },
    { id: "bets", label: "Bets", icon: <Target size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
  ];

  const pendingCount = notifications?.filter(
    (n) => n.status === "pending"
  ).length || 0;

  return (
    <div style={navContainer}>
      {/* Notifications Panel */}
      {notifications && notifications.length > 0 && (
        <div style={notificationsPanel}>
          <div style={notifHeader}>
            <Bell size={14} />
            <span>Pending Verifications</span>
            {pendingCount > 0 && (
              <div style={notifBadge}>{pendingCount}</div>
            )}
          </div>
          <div style={notifList}>
            {notifications.filter((n) => n.status === "pending").map((notif) => (
              <div key={notif.id} style={notifItem}>
                <div style={notifContent}>
                  <p style={notifText}>
                    {notif.from}: "{notif.activity}"
                  </p>
                  <span style={notifDate}>{notif.date}</span>
                </div>
                <div style={notifButtons}>
                  <button
                    onClick={() => onApproveNotif?.(notif.id)}
                    style={approveNotifBtn}
                    title="Approve"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => onRejectNotif?.(notif.id)}
                    style={rejectNotifBtn}
                    title="Reject"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div style={navItems}>
        {items.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={screen === item.id}
            onClick={() => setScreen(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        if (!active) el.style.color = "#f1efe9";
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.color = active ? "#7c9a7e" : "#a8a6a2";
        el.style.transform = "translateY(0)";
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3px",
        color: active ? "#7c9a7e" : "#a8a6a2",
        cursor: "pointer",
        transition: "all 0.2s ease",
        flex: 1,
        padding: "8px 14px",
        borderRadius: "100px",
        background: active ? "rgba(124,154,126,0.14)" : "transparent",
      }}
    >
      {icon}
      <span style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
    </div>
  );
}

const navContainer = {
  position: "fixed" as const,
  bottom: "24px",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: "12px",
  zIndex: 1000,
  maxWidth: "90vw",
  width: "auto",
};

const notificationsPanel = {
  background: "rgba(42,47,44,0.9)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)" as any,
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "16px",
  padding: "12px 16px",
  boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
  maxWidth: "400px",
};

const notifHeader = {
  display: "flex" as const,
  alignItems: "center",
  gap: "6px",
  color: "#a8a6a2",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  marginBottom: "10px",
  position: "relative" as const,
};

const notifBadge = {
  marginLeft: "auto",
  display: "flex" as const,
  alignItems: "center",
  justifyContent: "center",
  width: "18px",
  height: "18px",
  background: "#c4855a",
  color: "#1f2321",
  borderRadius: "50%",
  fontSize: "9px",
  fontWeight: 700,
};

const notifList = {
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: "8px",
  maxHeight: "200px",
  overflowY: "auto" as const,
};

const notifItem = {
  display: "flex" as const,
  alignItems: "center",
  gap: "10px",
  background: "#1f2321",
  borderRadius: "8px",
  padding: "8px 10px",
  border: "1px solid rgba(255,255,255,0.05)",
};

const notifContent = {
  flex: 1,
  minWidth: 0,
};

const notifText = {
  margin: 0,
  fontSize: "10px",
  color: "#f1efe9",
  fontWeight: 600,
  wordBreak: "break-word" as const,
};

const notifDate = {
  display: "block",
  fontSize: "9px",
  color: "#a8a6a2",
  marginTop: "2px",
};

const notifButtons = {
  display: "flex" as const,
  gap: "4px",
};

const approveNotifBtn = {
  width: "20px",
  height: "20px",
  borderRadius: "4px",
  border: "none",
  background: "rgba(124,154,126,0.2)",
  color: "#7c9a7e",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: 600,
  transition: "all 0.2s",
};

const rejectNotifBtn = {
  width: "20px",
  height: "20px",
  borderRadius: "4px",
  border: "none",
  background: "rgba(196,133,90,0.2)",
  color: "#c4855a",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: 600,
  transition: "all 0.2s",
};

const navItems = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "10px 16px",
  background: "rgba(42,47,44,0.9)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)" as any,
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "100px",
  boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
  minWidth: "300px",
};