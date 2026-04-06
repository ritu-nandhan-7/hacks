import { useState } from "react";
import { ArrowLeft, Zap, Trophy, Plus } from "lucide-react";
import AddSidequestModal from "../components/AddSidequestModal";
import type { Sidequest } from "../types/userData";

export default function SidequestsScreen({
  onBack,
  quests,
  onChange,
}: {
  onBack: () => void;
  quests: Sidequest[];
  onChange: (quests: Sidequest[]) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (newQuestData: {
    title: string;
    xp: string;
    brownie: string;
    achievements: string[];
    summary: string;
  }) => {
    const newQuest = {
      id: Math.max(...quests.map((q) => q.id), 0) + 1,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...newQuestData,
    };
    onChange([newQuest, ...quests]);
    setShowModal(false);
  };

  return (
    <div style={page}>
      <div style={inner}>

        <div style={topBar}>
          <button onClick={onBack} style={iconBtn}><ArrowLeft size={16} /></button>
          <h1 style={heading}>Sidequests</h1>
          <button onClick={() => setShowModal(true)} style={addBtn}><Plus size={14} /> New Sidequest</button>
        </div>

        <p style={{ color: "#a8a6a2", fontSize: 14, marginBottom: 32 }}>Bonus missions. 3 compensations per month.</p>

        <div style={sectionLabel}>Completed ({quests.length})</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {quests.map((q, i) => (
            <div key={i} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#f1efe9", margin: "0 0 4px" }}>{q.title}</p>
                  <span style={{ fontSize: 11, color: "#a8a6a2" }}>{q.date}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={xpBadge}><Zap size={10} /> {q.xp}</div>
                  <div style={brownieBadge}>{q.brownie} pts</div>
                </div>
              </div>
              <div style={divider} />
              <p style={{ fontSize: 13, color: "#a8a6a2", margin: "10px 0" }}>{q.summary}</p>
              {q.achievements.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {q.achievements.map((a, j) => (
                    <div key={j} style={chip}><Trophy size={10} /> {a}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && <AddSidequestModal onAdd={handleAdd} onClose={() => setShowModal(false)} />}
    </div>
  );
}

const page: React.CSSProperties    = { minHeight: "100vh", background: "#1f2321", display: "flex", justifyContent: "center", padding: "0 24px 120px" };
const inner: React.CSSProperties   = { width: "100%", maxWidth: 760, paddingTop: 40 };
const topBar: React.CSSProperties  = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 };
const iconBtn: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", border: "none", background: "#2a2f2c", color: "#a8a6a2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const heading: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: 26, color: "#f1efe9", margin: 0, fontWeight: 400 };
const addBtn: React.CSSProperties  = { display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: "#7c9a7e", color: "#1f2321", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const sectionLabel: React.CSSProperties = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6967", marginBottom: 12 };
const card: React.CSSProperties    = { background: "#2a2f2c", borderRadius: 16, padding: "18px 20px" };
const divider: React.CSSProperties = { height: 1, background: "rgba(255,255,255,0.05)" };
const xpBadge: React.CSSProperties = { display: "flex", alignItems: "center", gap: 4, background: "rgba(124,154,126,0.15)", color: "#7c9a7e", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 };
const brownieBadge: React.CSSProperties = { display: "flex", alignItems: "center", background: "rgba(196,133,90,0.12)", color: "#c4855a", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 };
const chip: React.CSSProperties    = { display: "flex", alignItems: "center", gap: 4, background: "rgba(245,200,66,0.08)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.15)", borderRadius: 100, padding: "3px 10px", fontSize: 11 };