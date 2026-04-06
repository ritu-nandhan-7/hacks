import { Bell, Check, X } from "lucide-react";
import type { BetNotification } from "../hooks/useNotifications";

interface NotificationPaneProps {
  notifications: BetNotification[];
  onApprove: (notificationId: string) => void;
  onReject: (notificationId: string) => void;
}

export default function NotificationPane({
  notifications,
  onApprove,
  onReject,
}: NotificationPaneProps) {
  const pendingNotifications = notifications.filter(
    (n) => n.status === "pending"
  );
  const hasNotifications = pendingNotifications.length > 0;

  return (
    <div style={container}>
      <div style={header}>
        <Bell size={16} />
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
          Notifications
        </span>
        {hasNotifications && (
          <div style={badgeStyle}>{pendingNotifications.length}</div>
        )}
      </div>

      <div style={notificationsList}>
        {pendingNotifications.length === 0 ? (
          <div style={emptyState}>No pending verifications</div>
        ) : (
          pendingNotifications.map((notif) => (
            <div key={notif.id} style={notificationCard}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={notifTitle}>
                  {notif.from} reported: "{notif.activity}"
                </p>
                <span style={notifDate}>{notif.date}</span>
              </div>
              <div style={buttonGroup}>
                <button
                  onClick={() => onApprove(notif.id)}
                  style={approveBtn}
                  title="Approve"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => onReject(notif.id)}
                  style={rejectBtn}
                  title="Reject"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const container = {
  background: "#252a27",
  borderRadius: "12px",
  padding: "12px 14px",
  fontSize: "12px",
  marginBottom: "20px",
};

const header = {
  display: "flex" as const,
  alignItems: "center",
  gap: "6px",
  color: "#a8a6a2",
  marginBottom: "12px",
  position: "relative" as const,
};

const badgeStyle = {
  display: "inline-flex" as const,
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  background: "#c4855a",
  color: "#1f2321",
  fontSize: "9px",
  fontWeight: 700,
  marginLeft: "auto",
};

const notificationsList = {
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: "8px",
  maxHeight: "200px",
  overflowY: "auto" as const,
};

const emptyState = {
  fontSize: "11px",
  color: "#6b6967",
  textAlign: "center" as const,
  padding: "12px 0",
};

const notificationCard = {
  background: "#1f2321",
  borderRadius: "8px",
  padding: "10px 12px",
  display: "flex" as const,
  alignItems: "center",
  gap: "10px",
  border: "1px solid rgba(255,255,255,0.05)",
};

const notifTitle = {
  margin: 0,
  fontSize: "11px",
  color: "#f1efe9",
  fontWeight: 600,
  wordBreak: "break-word" as const,
};

const notifDate = {
  fontSize: "10px",
  color: "#a8a6a2",
  display: "block",
  marginTop: "4px",
};

const buttonGroup = {
  display: "flex" as const,
  gap: "6px",
};

const approveBtn = {
  width: "24px",
  height: "24px",
  borderRadius: "6px",
  border: "none",
  background: "rgba(124, 154, 126, 0.2)",
  color: "#7c9a7e",
  cursor: "pointer",
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  transition: "all 0.2s",
};

const rejectBtn = {
  width: "24px",
  height: "24px",
  borderRadius: "6px",
  border: "none",
  background: "rgba(196, 133, 90, 0.2)",
  color: "#c4855a",
  cursor: "pointer",
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  transition: "all 0.2s",
};
