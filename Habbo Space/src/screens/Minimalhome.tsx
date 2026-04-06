import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Zap } from "lucide-react";
import type { Habit } from "../App";

export default function MinimalHome({
  habits, onToggle, onDelete, onAdd, onBack,
}: {
  habits: Habit[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onBack: () => void;
}) {
  const done   = habits.filter(h => h.done).length;
  const xp     = done * 10;
  const today  = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const streak = 7; // placeholder

  return (
    <div style={page}>
      <div style={inner}>

        {/* Top bar */}
        <div style={topBar}>
          <button onClick={onBack} style={iconBtn} title="Back to choose">
            <ArrowLeft size={16} />
          </button>
          <span style={{ ...modePill, color: "#7c9a7e", background: "rgba(124,154,126,0.12)" }}>Minimal</span>
          <div style={{ width: 36 }} />
        </div>

        {/* Two-column layout: main | sidebar */}
        <div style={layout}>

          {/* ── Left: habits ── */}
          <div style={mainCol}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={heading}>Today</h1>
              <p style={sub}>{today}</p>
            </div>

            {/* Progress bar */}
            {habits.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={label}>Daily Progress</span>
                  <span style={label}>{done} / {habits.length} done</span>
                </div>
                <div style={track}>
                  <div style={{ ...fill, width: habits.length ? `${(done / habits.length) * 100}%` : "0%" }} />
                </div>
                {done === habits.length && habits.length > 0 && (
                  <p style={{ color: "#7c9a7e", fontSize: 12, marginTop: 6 }}>✦ All habits complete — +{xp} XP earned</p>
                )}
              </div>
            )}

            {/* Habit list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {habits.length === 0 ? (
                <p style={{ color: "#a8a6a2", fontSize: 15, padding: "40px 0" }}>No habits yet. Add one to start earning XP.</p>
              ) : (
                habits.map(h => <HabitRow key={h.id} habit={h} onToggle={onToggle} onDelete={onDelete} />)
              )}
            </div>

            <button onClick={onAdd} style={addBtn}>
              <Plus size={15} /> Add Habit
            </button>
          </div>

          {/* ── Right: stats sidebar ── */}
          <div style={sidebar}>

            <div style={statCard}>
              <div style={statLabel}>XP Today</div>
              <div style={statValue}>{xp} <span style={{ fontSize: 13, color: "#a8a6a2" }}>pts</span></div>
            </div>

            <div style={statCard}>
              <div style={statLabel}>Streak</div>
              <div style={{ ...statValue, color: "#f5c842" }}>{streak} <span style={{ fontSize: 13, color: "#a8a6a2" }}>days</span></div>
            </div>

            <div style={statCard}>
              <div style={statLabel}>Brownie Points</div>
              <div style={{ ...statValue, color: "#c4855a" }}>1,200</div>
            </div>

            <div style={{ ...statCard, background: "rgba(124,154,126,0.08)", border: "1px solid rgba(124,154,126,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Zap size={13} color="#7c9a7e" />
                <span style={{ ...statLabel, margin: 0 }}>Active Sidequest</span>
              </div>
              <p style={{ fontSize: 13, color: "#f1efe9", margin: "0 0 4px" }}>7-Day Reading Challenge</p>
              <p style={{ fontSize: 11, color: "#a8a6a2", margin: 0 }}>Day 4 of 7 · +50 XP on completion</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function HabitRow({ habit, onToggle, onDelete }: { habit: Habit; onToggle: (id: number) => void; onDelete: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 20px", borderRadius: 14,
        background: hovered ? "#2f3431" : "#272c29",
        transition: "background 0.15s",
      }}
    >
      <div onClick={() => onToggle(habit.id)} style={{
        width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: "pointer",
        border: habit.done ? "none" : "1.5px solid rgba(255,255,255,0.2)",
        background: habit.done ? "#7c9a7e" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#1f2321", fontSize: 12, fontWeight: 700, transition: "all 0.2s",
      }}>
        {habit.done && "✓"}
      </div>

      <span onClick={() => onToggle(habit.id)} style={{
        flex: 1, fontSize: 15, cursor: "pointer",
        color: habit.done ? "#6b6967" : "#f1efe9",
        textDecoration: habit.done ? "line-through" : "none",
        transition: "all 0.2s",
      }}>
        {habit.name}
      </span>

      {habit.done && (
        <span style={{ fontSize: 11, color: "#7c9a7e", fontWeight: 600 }}>+10 XP</span>
      )}

      {hovered && (
        <button onClick={() => onDelete(habit.id)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#7a4040", padding: "2px 4px", display: "flex", alignItems: "center",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c47070"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#7a4040"}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const page: React.CSSProperties  = { minHeight: "100vh", background: "#1f2321", display: "flex", justifyContent: "center", padding: "0 24px 120px" };
const inner: React.CSSProperties = { width: "100%", maxWidth: 900, paddingTop: 40 };
const topBar: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 };
const layout: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, alignItems: "start" };
const mainCol: React.CSSProperties = {};
const sidebar: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const statCard: React.CSSProperties = { background: "#2a2f2c", borderRadius: 14, padding: "16px 18px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" };
const statLabel: React.CSSProperties = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6967", marginBottom: 6 };
const statValue: React.CSSProperties = { fontSize: 26, fontWeight: 700, color: "#f1efe9", fontFamily: "Georgia, serif" };
const iconBtn: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", border: "none", background: "#2a2f2c", color: "#a8a6a2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const modePill: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 14px", borderRadius: 100 };
const heading: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: 38, color: "#f1efe9", margin: "0 0 6px", fontWeight: 400 };
const sub: React.CSSProperties     = { color: "#a8a6a2", fontSize: 14, margin: 0 };
const label: React.CSSProperties   = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6b6967" };
const track: React.CSSProperties   = { height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" };
const fill: React.CSSProperties    = { height: "100%", background: "#7c9a7e", borderRadius: 100, transition: "width 0.4s ease" };
const addBtn: React.CSSProperties  = { display: "flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.12)", background: "transparent", color: "#a8a6a2", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" };