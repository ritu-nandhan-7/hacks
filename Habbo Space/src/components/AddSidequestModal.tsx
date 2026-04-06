import { useState } from "react";

interface AddSidequestModalProps {
  onAdd: (quest: {
    title: string;
    xp: string;
    brownie: string;
    achievements: string[];
    summary: string;
  }) => void;
  onClose: () => void;
}

export default function AddSidequestModal({ onAdd, onClose }: AddSidequestModalProps) {
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState("");
  const [brownie, setBrownie] = useState("");
  const [achievements, setAchievements] = useState("");
  const [summary, setSummary] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !xp.trim() || !brownie.trim() || !achievements.trim() || !summary.trim()) {
      alert("Please fill in all fields!");
      return;
    }

    onAdd({
      title: title.trim(),
      xp: xp.trim(),
      brownie: brownie.trim(),
      achievements: achievements.split(",").map((a) => a.trim()).filter((a) => a),
      summary: summary.trim(),
    });

    setTitle("");
    setXp("");
    setBrownie("");
    setAchievements("");
    setSummary("");
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#f1efe9", margin: 0 }}>
            ⚡ New Sidequest
          </h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}> Quest Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 7-Day Reading Challenge"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}> XP Reward</label>
            <input
              type="text"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              placeholder="e.g., +50 XP"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}> Brownie Points</label>
            <input
              type="text"
              value={brownie}
              onChange={(e) => setBrownie(e.target.value)}
              placeholder="e.g., +200"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}> Achievements (comma-separated)</label>
            <input
              type="text"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="e.g., Bookworm, 7-Day Streak"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}> Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g., Read 30 mins every day for a week."
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleSubmit} style={submitBtnStyle}>Create Sidequest</button>
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
