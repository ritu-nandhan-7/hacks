import { ArrowLeft } from "lucide-react";

export default function ChooseScreen({
  onBack,
  onChoose,
}: {
  onBack: () => void;
  onChoose: (mode: "minimal" | "gamified") => void;
}) {
  return (
    <div style={page}>

      <button onClick={onBack} style={backBtn} title="Back to login">
        <ArrowLeft size={16} />
      </button>

      <div style={center}>
        <h1 style={heading}>Choose Your Style</h1>
        <p style={sub}>There's no one way to build a habit</p>

        <div style={grid}>
          <ChoiceCard
            title="Minimal"
            description="Quiet, focused habit tracking. No distractions — just your list and a checkbox."
            features={["Daily checklist", "Progress bar", "Add & remove habits"]}
            accentColor="#a8a6a2"
            onClick={() => onChoose("minimal")}
          />
          <ChoiceCard
            title="Gamified"
            description="Turn your habits into a game. Earn XP, complete side quests, and bet with friends."
            features={["XP & streaks", "Side quests", "Bets & leaderboards"]}
            accentColor="#7c9a7e"
            highlight
            onClick={() => onChoose("gamified")}
          />
        </div>

        <p style={{ color: "#6b6967", fontSize: 12, marginTop: 28 }}>You can switch anytime from settings</p>
      </div>

    </div>
  );
}

function ChoiceCard({
  title, description, features, accentColor, highlight = false, onClick,
}: {
  title: string;
  description: string;
  features: string[];
  accentColor: string;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = highlight ? "0 20px 60px rgba(124,154,126,0.2)" : "0 20px 60px rgba(0,0,0,0.5)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = highlight ? "0 8px 32px rgba(124,154,126,0.12)" : "0 8px 32px rgba(0,0,0,0.25)"; }}
      style={{
        background: highlight ? "rgba(124,154,126,0.07)" : "#2a2f2c",
        border: `1px solid ${highlight ? "rgba(124,154,126,0.22)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 20, padding: "32px 28px", cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: highlight ? "0 8px 32px rgba(124,154,126,0.12)" : "0 8px 32px rgba(0,0,0,0.25)",
      }}
    >
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#f1efe9", margin: "0 0 10px", fontWeight: 400 }}>{title}</h2>
      <p style={{ fontSize: 14, color: "#a8a6a2", margin: "0 0 24px", lineHeight: 1.6 }}>{description}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: accentColor }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
            {f}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, fontSize: 13, fontWeight: 600, color: accentColor }}>
        Choose {title} →
      </div>
    </div>
  );
}

const page: React.CSSProperties   = { minHeight: "100vh", background: "#1f2321", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, position: "relative" };
const backBtn: React.CSSProperties = { position: "absolute", top: 28, left: 28, width: 36, height: 36, borderRadius: "50%", border: "none", background: "#2a2f2c", color: "#a8a6a2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const center: React.CSSProperties = { textAlign: "center", width: "100%", maxWidth: 760 };
const heading: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: 32, color: "#f1efe9", margin: "0 0 10px", fontWeight: 400 };
const sub: React.CSSProperties    = { color: "#a8a6a2", fontSize: 15, margin: "0 0 40px" };
const grid: React.CSSProperties   = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, textAlign: "left" };