import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

const FREQUENCIES = ["Daily", "Weekdays", "Weekends", "3× Week", "Custom"];
const TIMES = [
  { label: "Morning",   sub: "Before noon" },
  { label: "Afternoon", sub: "12pm – 5pm"  },
  { label: "Evening",   sub: "After 5pm"   },
  { label: "Anytime",   sub: "No preference" },
];

export default function AddHabitScreen({
  onAdd,
  onBack,
}: {
  onAdd: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName]       = useState("");
  const [freq, setFreq]       = useState("Daily");
  const [time, setTime]       = useState("Anytime");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length > 0;

  const handleAdd = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => {
      onAdd(name.trim());
    }, 500);
  };

  return (
    <div style={page}>
      <div style={inner}>

        {/* Top bar */}
        <div style={topBar}>
          <button onClick={onBack} style={iconBtn}>
            <ArrowLeft size={16} />
          </button>
          <h1 style={heading}>New Habit</h1>
          <div style={{ width: 36 }} />
        </div>

        {/* Name */}
        <Section label="Habit name">
          <input
            type="text"
            placeholder="e.g. Drink 2L of water"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            maxLength={50}
            autoFocus
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "rgba(124,154,126,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          {name.length > 0 && (
            <div style={{ fontSize: 11, color: "#6b6967", marginTop: 6, textAlign: "right" }}>
              {50 - name.length} chars left
            </div>
          )}
        </Section>

        {/* Frequency */}
        <Section label="How often?">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FREQUENCIES.map(f => (
              <button key={f} onClick={() => setFreq(f)} style={{
                padding: "8px 18px", borderRadius: 100, border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                background: freq === f ? "#7c9a7e" : "rgba(255,255,255,0.06)",
                color: freq === f ? "#1f2321" : "#a8a6a2",
                transition: "all 0.15s",
              }}>
                {f}
              </button>
            ))}
          </div>
        </Section>

        {/* Time of day */}
        <Section label="Best time">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {TIMES.map(t => (
              <button key={t.label} onClick={() => setTime(t.label)} style={{
                padding: "14px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                border: `1px solid ${time === t.label ? "rgba(124,154,126,0.4)" : "rgba(255,255,255,0.06)"}`,
                background: time === t.label ? "rgba(124,154,126,0.1)" : "rgba(255,255,255,0.03)",
                transition: "all 0.15s", fontFamily: "inherit",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: time === t.label ? "#7c9a7e" : "#f1efe9", marginBottom: 3 }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 11, color: "#a8a6a2" }}>{t.sub}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Preview */}
        {name.trim() && (
          <div style={{ ...card, background: "rgba(124,154,126,0.06)", border: "1px solid rgba(124,154,126,0.15)", marginBottom: 20 }}>
            <SectionLabel>Preview</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: "1.5px solid rgba(255,255,255,0.15)" }} />
              <span style={{ fontSize: 15, color: "#f1efe9" }}>{name.trim()}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#a8a6a2" }}>{freq} · {time}</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleAdd}
          disabled={!canSubmit}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: canSubmit ? (submitted ? "#5a7a5c" : "#7c9a7e") : "rgba(255,255,255,0.06)",
            color: canSubmit ? "#1f2321" : "#a8a6a2",
            fontSize: 15, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit", transition: "all 0.2s",
            boxShadow: canSubmit ? "0 4px 20px rgba(124,154,126,0.3)" : "none",
          }}
        >
          {submitted ? <><Check size={16} /> Added!</> : "Add Habit"}
        </button>

      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={card}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#6b6967", marginBottom: 12 }}>
      {children}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const page: React.CSSProperties  = { minHeight: "100vh", background: "#1f2321", display: "flex", justifyContent: "center", padding: "0 24px 80px" };
const inner: React.CSSProperties = { width: "100%", maxWidth: 640, paddingTop: 40 };
const topBar: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 };
const iconBtn: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", border: "none", background: "#2a2f2c", color: "#a8a6a2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const heading: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: 22, color: "#f1efe9", margin: 0, fontWeight: 400 };
const card: React.CSSProperties    = { background: "#2a2f2c", borderRadius: 16, padding: "20px 22px", marginBottom: 14 };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
  color: "#f1efe9", fontSize: 15, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s",
};