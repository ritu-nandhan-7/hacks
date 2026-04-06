import { useState } from "react";
import { ArrowLeft, Target, CheckCircle, XCircle, LogOut } from "lucide-react";
import AddBetModal from "../components/AddBetModal";
import type { Bet } from "../types/userData";

export default function BetsScreen({
  onBack,
  bets,
  onChange,
  onShowSidequest,
  onAddNotification,
}: {
  onBack: () => void;
  bets: Bet[];
  onChange: (bets: Bet[]) => void;
  onShowSidequest?: (questId: string) => void;
  onAddNotification?: (notification: any) => void;
}) {
  const [showAddBet, setShowAddBet] = useState(false);
  const [loggingBetId, setLoggingBetId] = useState<string | null>(null);

  const handleAddBet = (betData: {
    activity: string;
    opponent: string;
    stake: string;
    frequency: string;
    startDate: string;
    endDate: string;
  }) => {
    const newBet: Bet = {
      id: `bet-${Date.now()}`,
      title: `${betData.opponent} bets you won't ${betData.activity}`,
      activity: betData.activity,
      opponent: betData.opponent,
      stake: betData.stake,
      status: "pending",
      frequency: betData.frequency,
      startDate: betData.startDate,
      endDate: betData.endDate,
      linkedSidequests: [],
      logsThisMonth: [],
    };
    onChange([...bets, newBet]);
    setShowAddBet(false);
  };

  const handleConfirmBet = (betId: string) => {
    onChange(
      bets.map((b) => (b.id === betId ? { ...b, status: "accepted" } : b))
    );
  };

  const handleDenyBet = (betId: string) => {
    onChange(
      bets.map((b) => (b.id === betId ? { ...b, status: "failed" } : b))
    );
  };

  const handleLogActivity = (betId: string) => {
    const today = new Date().toISOString().split("T")[0];
    onChange(
      bets.map((b) =>
        b.id === betId
          ? {
              ...b,
              logsThisMonth: [
                ...b.logsThisMonth,
                { date: today, verificationStatus: "pending", verifiedBy: null },
              ],
            }
          : b
      )
    );
    const bet = bets.find((item) => item.id === betId);
    if (bet && onAddNotification) {
      onAddNotification({
        id: `notif-${Date.now()}`,
        type: "bet-log",
        title: "Bet activity logged",
        message: `${bet.activity} sent to ${bet.opponent} for verification`,
      });
    }
    setLoggingBetId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return { bg: "rgba(124,154,126,0.1)", color: "#7c9a7e" };
      case "pending":
        return { bg: "rgba(245,200,66,0.1)", color: "#f5c842" };
      case "completed":
        return { bg: "rgba(124,154,126,0.15)", color: "#7c9a7e" };
      case "failed":
        return { bg: "rgba(196,133,90,0.1)", color: "#c4855a" };
      default:
        return { bg: "rgba(168,166,162,0.1)", color: "#a8a6a2" };
    }
  };

  const daysRemaining = (bet: Bet) => {
    const start = new Date(bet.startDate);
    const end = new Date(bet.endDate);
    const today = new Date();
    const daysLeft = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${Math.max(0, daysLeft)} of ${totalDays} remaining`;
  };

  return (
    <div style={page}>
      <div style={inner}>
        <div style={topBar}>
          <button onClick={onBack} style={iconBtn}>
            <ArrowLeft size={16} />
          </button>
          <h1 style={heading}>Bets</h1>
          <button
            onClick={() => setShowAddBet(true)}
            style={addBtn}
          >
            <Target size={14} /> New Bet
          </button>
        </div>

        <p style={{ color: "#a8a6a2", fontSize: 14, marginBottom: 32 }}>
          Challenge friends. Put points on the line.
        </p>

        {bets.length > 0 && (
          <>
            <div style={sectionLabel}>All Bets ({bets.length})</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bets.map((b) => {
                const colors = getStatusColor(b.status);
                const isLogging = loggingBetId === b.id;

                return (
                  <div key={b.id} style={card}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom:
                          b.status === "pending" || b.status === "accepted" ||
                          isLogging
                            ? "12px"
                            : "0",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 15,
                            color: "#f1efe9",
                            margin: "0 0 6px",
                          }}
                        >
                          {b.activity}
                        </p>
                        <span style={{ fontSize: 12, color: "#a8a6a2" }}>
                          vs {b.opponent} · {daysRemaining(b)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            padding: "3px 10px",
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 600,
                            background: colors.bg,
                            color: colors.color,
                          }}
                        >
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#c4855a",
                            fontWeight: 600,
                          }}
                        >
                          {b.stake}
                        </span>
                      </div>
                    </div>

                    {/* Pending Bet Actions */}
                    {b.status === "pending" && (
                      <div style={actionGroup}>
                        <button
                          onClick={() => handleConfirmBet(b.id)}
                          style={confirmBtn}
                        >
                          <CheckCircle size={14} /> Accept Bet
                        </button>
                        <button
                          onClick={() => handleDenyBet(b.id)}
                          style={denyBtn}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}

                    {/* Accepted Bet Actions */}
                    {b.status === "accepted" && !isLogging && (
                      <div style={actionGroup}>
                        <button
                          onClick={() => setLoggingBetId(b.id)}
                          style={logBtn}
                        >
                          <LogOut size={14} /> Log Activity Today
                        </button>
                        {b.linkedSidequests.length > 0 && (
                          <button
                            onClick={() =>
                              onShowSidequest?.(b.linkedSidequests[0])
                            }
                            style={sidequestBtn}
                          >
                            ⚡ Do Sidequest Instead
                          </button>
                        )}
                      </div>
                    )}

                    {/* Logging Confirmation */}
                    {isLogging && (
                      <div style={actionGroup}>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#a8a6a2",
                            margin: "0 0 10px",
                          }}
                        >
                          Logging activity sends a verification request to{" "}
                          {b.opponent}
                        </p>
                        <button
                          onClick={() => handleLogActivity(b.id)}
                          style={confirmBtn}
                        >
                          ✓ Send for Verification
                        </button>
                        <button
                          onClick={() => setLoggingBetId(null)}
                          style={cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Recent Logs */}
                    {b.logsThisMonth.length > 0 && (
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "10px",
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span style={{ fontSize: 10, color: "#6b6967" }}>
                          Recent logs: {b.logsThisMonth.length}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {bets.length === 0 && (
          <div style={emptyState}>
            <p style={{ color: "#a8a6a2", marginBottom: "16px" }}>
              No bets yet. Create your first bet to get started!
            </p>
            <button
              onClick={() => setShowAddBet(true)}
              style={createFirstBetBtn}
            >
              <Target size={14} /> Create First Bet
            </button>
          </div>
        )}
      </div>

      {showAddBet && (
        <AddBetModal
          onAdd={handleAddBet}
          onClose={() => setShowAddBet(false)}
        />
      )}
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#1f2321",
  display: "flex",
  justifyContent: "center",
  padding: "0 24px 120px",
};
const inner: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  paddingTop: 40,
};
const topBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};
const iconBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "none",
  background: "#2a2f2c",
  color: "#a8a6a2",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const heading: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 26,
  color: "#f1efe9",
  margin: 0,
  fontWeight: 400,
};
const addBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 18px",
  borderRadius: 10,
  border: "none",
  background: "#7c9a7e",
  color: "#1f2321",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};
const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#6b6967",
  marginBottom: 12,
};
const card: React.CSSProperties = {
  background: "#2a2f2c",
  borderRadius: 16,
  padding: "18px 20px",
};

const actionGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const confirmBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "#7c9a7e",
  color: "#1f2321",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const denyBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "#c4855a",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const logBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "#7c9a7e",
  color: "#1f2321",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const sidequestBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,165,0,0.3)",
  background: "rgba(255,165,0,0.1)",
  color: "#f5c842",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const cancelBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "#a8a6a2",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: "40px 20px",
  color: "#a8a6a2",
};

const createFirstBetBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  background: "#7c9a7e",
  color: "#1f2321",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};