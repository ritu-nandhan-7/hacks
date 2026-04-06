import { useState } from "react";

interface AddBetModalProps {
  onAdd: (bet: {
    activity: string;
    opponent: string;
    stake: string;
    frequency: string;
    startDate: string;
    endDate: string;
  }) => void;
  onClose: () => void;
}

export default function AddBetModal({ onAdd, onClose }: AddBetModalProps) {
  const [activity, setActivity] = useState("");
  const [opponent, setOpponent] = useState("");
  const [stake, setStake] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = () => {
    if (
      !activity.trim() ||
      !opponent.trim() ||
      !stake.trim() ||
      !startDate ||
      !endDate
    ) {
      alert("Please fill in all fields!");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert("End date must be after start date!");
      return;
    }

    onAdd({
      activity: activity.trim(),
      opponent: opponent.trim(),
      stake: stake.trim(),
      frequency,
      startDate,
      endDate,
    });

    setActivity("");
    setOpponent("");
    setStake("");
    setFrequency("daily");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "20px",
              color: "#f1efe9",
              margin: 0,
            }}
          >
            🎯 New Bet
          </h2>
          <button onClick={onClose} style={closeBtn}>
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>🎬 Activity</label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g., Go for a 30-min run"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>👤 Opponent (Friend Name)</label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="e.g., Priya"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>⭐ Stake (Points)</label>
            <input
              type="text"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="e.g., 200 pts"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>📅 Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              style={selectStyle}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>📍 Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>📍 End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button onClick={onClose} style={cancelBtnStyle}>
              Cancel
            </button>
            <button onClick={handleSubmit} style={submitBtnStyle}>
              Create Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 300,
};

const modal = {
  background: "#252a27",
  borderRadius: "20px",
  padding: "24px",
  width: "90%",
  maxWidth: "420px",
  boxShadow: "0 16px 60px rgba(0,0,0,0.6)",
  animation: "fadeIn 0.3s ease-out",
};

const labelStyle = {
  display: "block" as const,
  fontSize: "12px",
  fontWeight: 600,
  color: "#a8a6a2",
  marginBottom: "6px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const inputStyle = {
  width: "100%",
  background: "#1f2321",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  padding: "10px 14px",
  color: "#f1efe9",
  fontSize: "14px",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
  transition: "border-color 0.2s",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

const cancelBtnStyle = {
  flex: 1,
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "#a8a6a2",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const submitBtnStyle = {
  flex: 1,
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#7c9a7e",
  color: "#1f2321",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const closeBtn = {
  background: "none",
  border: "none",
  color: "#a8a6a2",
  fontSize: "20px",
  cursor: "pointer",
  padding: "0",
  transition: "color 0.2s",
};
