import { Home, Zap, Target, User } from "lucide-react";
import type { Screen } from "../App";

const ITEMS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: "gamified-home",    label: "Home",    icon: <Home size={16} /> },
  { id: "gamified-quests",  label: "Quests",  icon: <Zap size={16} /> },
  { id: "gamified-bets",    label: "Bets",    icon: <Target size={16} /> },
  { id: "gamified-profile", label: "Profile", icon: <User size={16} /> },
];

export default function GamifiedNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  return (
    <nav style={navWrap}>
      {ITEMS.map(item => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={screen === item.id}
          onClick={() => setScreen(item.id)}
        />
      ))}
    </nav>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
      color: active ? "#7c9a7e" : "#a8a6a2",
      cursor: "pointer", transition: "all 0.2s ease",
      padding: "8px 20px", borderRadius: "100px",
      background: active ? "rgba(124,154,126,0.14)" : "transparent",
    }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#f1efe9"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? "#7c9a7e" : "#a8a6a2"; }}
    >
      {icon}
      <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

const navWrap: React.CSSProperties = {
  position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
  display: "flex", alignItems: "center", gap: "4px",
  padding: "10px 16px",
  background: "rgba(31,35,33,0.92)", backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.07)", borderRadius: "100px",
  boxShadow: "0 12px 48px rgba(0,0,0,0.5)", zIndex: 1000,
    };