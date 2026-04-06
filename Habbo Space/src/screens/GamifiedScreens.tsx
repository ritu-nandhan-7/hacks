import { useState, useEffect } from "react";
import { Zap, Target, ArrowLeft, CheckCircle, XCircle, Plus, Trash2, Star } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Quest = { id: number; title: string; date: string; xp: string; achievements: string[] };
type Bet   = { id: number; title: string; with: string; myDone: boolean; theirDone: boolean; reward: string };

const INIT_QUESTS: Quest[] = [
  { id: 1, title: "7-Day Reading Challenge", date: "Mar 10–16", xp: "+50 XP", achievements: ["📚 Bookworm", "🔥 Streak"] },
  { id: 2, title: "Morning Walk Sprint",     date: "Feb 22–28", xp: "+40 XP", achievements: ["🌅 Early Bird"] },
];

const INIT_BETS: Bet[] = [
  { id: 1, title: "Run 1km today",    with: "Arjun", myDone: false, theirDone: true,  reward: "+1 Rep · +10 🍪" },
  { id: 2, title: "Meditate 10 mins", with: "Priya", myDone: true,  theirDone: false, reward: "+1 Rep · +10 🍪" },
];

// ─────────────────────────────────────────────────────────────────────────────
// House SVG — pixel-art aesthetic
// ─────────────────────────────────────────────────────────────────────────────
function HouseSVG({ onClick, zooming }: { onClick: () => void; zooming: boolean }) {
  return (
    <div
      onClick={onClick}
      title="Click to explore your house"
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        transition: "transform 0.6s cubic-bezier(0.34,1.2,0.64,1)",
        transform: zooming ? "scale(6)" : "scale(1)",
        opacity: zooming ? 0 : 1,
        transitionProperty: "transform, opacity",
      }}
      onMouseEnter={e => { if (!zooming) (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
      onMouseLeave={e => { if (!zooming) (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
    >
      <svg width="240" height="218" viewBox="0 0 240 218" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ground shadow */}
        <ellipse cx="120" cy="210" rx="78" ry="8" fill="rgba(0,0,0,0.28)" />

        {/* House body */}
        <rect x="44" y="108" width="152" height="96" rx="5" fill="#3a4a3c" />

        {/* Roof */}
        <polygon points="28,114 120,42 212,114" fill="#4e6b50" />
        <polygon points="28,114 120,42 212,114" fill="none" stroke="#2d3e2f" strokeWidth="2.5" />

        {/* Chimney */}
        <rect x="154" y="54" width="20" height="36" rx="2" fill="#4e6b50" />
        <rect x="150" y="48" width="28" height="8" rx="3" fill="#5c7a5e" />

        {/* Smoke puffs */}
        <circle cx="164" cy="38" r="5" fill="rgba(168,166,162,0.18)" />
        <circle cx="168" cy="28" r="7" fill="rgba(168,166,162,0.12)" />
        <circle cx="162" cy="18" r="5" fill="rgba(168,166,162,0.08)" />

        {/* Door */}
        <rect x="96" y="152" width="48" height="52" rx="7" fill="#2a2f2c" />
        <rect x="98" y="154" width="44" height="48" rx="6" fill="#1e2820" />
        {/* Door arch */}
        <path d="M98 178 Q120 154 142 178" fill="#1e2820" stroke="none" />
        {/* Door knob */}
        <circle cx="138" cy="180" r="3.5" fill="#7c9a7e" />
        {/* Door panel lines */}
        <rect x="100" y="158" width="20" height="18" rx="3" fill="rgba(255,255,255,0.04)" />
        <rect x="124" y="158" width="16" height="18" rx="3" fill="rgba(255,255,255,0.04)" />

        {/* Window left */}
        <rect x="56" y="122" width="40" height="34" rx="6" fill="#2a2f2c" />
        <rect x="58" y="124" width="36" height="30" rx="5" fill="#1a3a2a" />
        <line x1="76" y1="124" x2="76" y2="154" stroke="#2a2f2c" strokeWidth="2" />
        <line x1="58" y1="139" x2="94" y2="139" stroke="#2a2f2c" strokeWidth="2" />
        <rect x="58" y="124" width="36" height="30" rx="5" fill="rgba(255,200,80,0.08)" />

        {/* Window right */}
        <rect x="144" y="122" width="40" height="34" rx="6" fill="#2a2f2c" />
        <rect x="146" y="124" width="36" height="30" rx="5" fill="#1a3a2a" />
        <line x1="164" y1="124" x2="164" y2="154" stroke="#2a2f2c" strokeWidth="2" />
        <line x1="146" y1="139" x2="182" y2="139" stroke="#2a2f2c" strokeWidth="2" />
        <rect x="146" y="124" width="36" height="30" rx="5" fill="rgba(255,200,80,0.08)" />

        {/* Roof ridge */}
        <line x1="120" y1="42" x2="120" y2="108" stroke="#3a4a3c" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.6" />

        {/* Grass */}
        <rect x="34" y="200" width="172" height="7" rx="3.5" fill="#4e6b50" />

        {/* Decorations from achievements */}
        <circle cx="52" cy="108" r="4" fill="#7c9a7e" opacity="0.6" />
        <circle cx="188" cy="108" r="4" fill="#7c9a7e" opacity="0.6" />

        {/* Star decoration top */}
        <text x="112" y="37" fontSize="10" fill="#f5c842" opacity="0.7">★</text>
      </svg>

      <span style={{
        fontSize: "11px", color: "#7c9a7e", fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase",
        opacity: zooming ? 0 : 1, transition: "opacity 0.2s",
      }}>
        Tap to explore →
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// House Detail — rooms grid (connects to /models/*.glb in repo)
// ─────────────────────────────────────────────────────────────────────────────
function HouseDetail({ onClose }: { onClose: () => void }) {
  const rooms = [
    { name: "Living Room", emoji: "🛋️", unlocked: true,  items: ["📚 Bookshelf", "🎸 Guitar", "🏆 Trophy"] },
    { name: "Kitchen",     emoji: "🍳", unlocked: true,  items: ["🥗 Herb Garden", "🍎 Fruit Bowl"] },
    { name: "Gym",         emoji: "💪", unlocked: false, items: [] },
    { name: "Study",       emoji: "📖", unlocked: false, items: [] },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#1f2321", zIndex: 500,
      display: "flex", flexDirection: "column",
      animation: "roomZoomIn 0.4s cubic-bezier(0.34,1.4,0.64,1) both",
    }}>
      <style>{`
        @keyframes roomZoomIn {
          from { transform: scale(0.6) translateY(60px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "52px 20px 24px", gap: "14px" }}>
        <button onClick={onClose} style={iconBtn}><ArrowLeft size={16} /></button>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#f1efe9", margin: 0 }}>Your House</h2>
          <p style={{ fontSize: "12px", color: "#a8a6a2", margin: 0 }}>Floor 1 · 2 rooms unlocked</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 40px" }}>
        {/* 3D model integration note */}
        <div style={{
          background: "rgba(124,154,126,0.08)", border: "1px dashed rgba(124,154,126,0.25)",
          borderRadius: "16px", padding: "14px 16px", marginBottom: "22px",
          fontSize: "12px", color: "#7c9a7e", textAlign: "center", lineHeight: 1.6,
        }}>
          🏗️ 3D viewer loads <code style={{ background: "rgba(0,0,0,0.2)", padding: "2px 5px", borderRadius: "4px", fontSize: "10px" }}>/models/house.glb</code> from your repo via Three.js
        </div>

        {/* Room grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {rooms.map((r, i) => (
            <div key={i} style={{
              background: r.unlocked ? "#2a2f2c" : "rgba(255,255,255,0.03)",
              borderRadius: "18px", padding: "18px",
              border: r.unlocked ? "none" : "1px dashed rgba(255,255,255,0.08)",
              opacity: r.unlocked ? 1 : 0.5,
              cursor: r.unlocked ? "pointer" : "default",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => { if (r.unlocked) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: "30px", marginBottom: "8px" }}>{r.emoji}</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1efe9", marginBottom: "4px" }}>{r.name}</div>
              {r.unlocked ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                  {r.items.map((item, j) => (
                    <span key={j} style={{
                      background: "rgba(124,154,126,0.12)", color: "#7c9a7e",
                      borderRadius: "100px", padding: "3px 8px", fontSize: "10px",
                    }}>{item}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "11px", color: "#a8a6a2", marginTop: "6px" }}>🔒 Complete more habits</div>
              )}
            </div>
          ))}
        </div>

        {/* Next floor teaser */}
        <div style={{
          marginTop: "16px", padding: "16px", borderRadius: "16px",
          background: "rgba(245,200,66,0.06)", border: "1px dashed rgba(245,200,66,0.2)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "20px", marginBottom: "6px" }}>🏠</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#f5c842" }}>Floor 2 locked</div>
          <div style={{ fontSize: "11px", color: "#a8a6a2", marginTop: "4px" }}>Complete 5 more habits to unlock</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel Sheet — reusable bottom drawer
// ─────────────────────────────────────────────────────────────────────────────
function PanelSheet({ title, emoji, onClose, children }: {
  title: string; emoji: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }} onClick={onClose}>
      <div
        style={{
          background: "#252a27", borderRadius: "24px 24px 0 0", padding: "24px 20px 48px",
          maxHeight: "78vh", overflowY: "auto",
          boxShadow: "0 -16px 60px rgba(0,0,0,0.6)",
          animation: "slideUp 0.32s cubic-bezier(0.34,1.3,0.64,1) both",
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#f1efe9", margin: 0 }}>
            {emoji} {title}
          </h2>
          <button onClick={onClose} style={iconBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidequests Panel
// ─────────────────────────────────────────────────────────────────────────────
function SidequestsPanel({ onClose }: { onClose: () => void }) {
  const [quests, setQuests] = useState<Quest[]>(INIT_QUESTS);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [nextId, setNextId] = useState(50);

  const addQuest = () => {
    const title = prompt("Name your sidequest:");
    if (!title?.trim()) return;
    setQuests(prev => [{
      id: nextId, title: title.trim(), date: "Just started", xp: "+? XP", achievements: [],
    }, ...prev]);
    setNextId(n => n + 1);
  };

  const deleteQuest = (id: number) => { setQuests(prev => prev.filter(q => q.id !== id)); setConfirmId(null); };

  return (
    <PanelSheet title="Sidequests" emoji="⚡" onClose={onClose}>
      <button style={panelAddBtn} onClick={addQuest}><Plus size={14} /> New Sidequest</button>

      {quests.length === 0 && <EmptyMsg text="No sidequests yet!" />}

      {quests.map(q => (
        <div key={q.id} style={panelCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={panelCardTitle}>{q.title}</div>
              <div style={panelCardSub}>{q.date} · <span style={{ color: "#7c9a7e" }}>{q.xp}</span></div>
              {q.achievements.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                  {q.achievements.map((a, i) => (
                    <span key={i} style={achieveChip}>{a}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setConfirmId(q.id)} style={trashBtnStyle}><Trash2 size={13} /></button>
          </div>
        </div>
      ))}

      {/* Confirm delete */}
      {confirmId !== null && (
        <div style={miniOverlay} onClick={() => setConfirmId(null)}>
          <div style={miniSheet} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "28px", textAlign: "center", marginBottom: "10px" }}>🗑️</div>
            <p style={{ color: "#f1efe9", fontWeight: 600, textAlign: "center", fontFamily: "Georgia, serif", fontSize: "16px", margin: "0 0 6px" }}>Delete Sidequest?</p>
            <p style={{ color: "#a8a6a2", fontSize: "12px", textAlign: "center", margin: "0 0 18px" }}>This can't be undone.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setConfirmId(null)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={() => deleteQuest(confirmId)} style={deleteBtnStyle}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </PanelSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bets Panel
// ─────────────────────────────────────────────────────────────────────────────
function BetsPanel({ onClose }: { onClose: () => void }) {
  const [bets, setBets] = useState<Bet[]>(INIT_BETS);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [nextId, setNextId] = useState(50);

  const addBet = () => {
    const title = prompt("Bet task?");
    if (!title?.trim()) return;
    const person = prompt("Bet with who?");
    if (!person?.trim()) return;
    setBets(prev => [...prev, { id: nextId, title: title.trim(), with: person.trim(), myDone: false, theirDone: false, reward: "+1 Rep · +10 🍪" }]);
    setNextId(n => n + 1);
  };

  const deleteBet = (id: number) => { setBets(prev => prev.filter(b => b.id !== id)); setConfirmId(null); };

  return (
    <PanelSheet title="Group Bets" emoji="🎯" onClose={onClose}>
      <button style={panelAddBtn} onClick={addBet}><Plus size={14} /> New Bet</button>

      {bets.length === 0 && <EmptyMsg text="No active bets!" />}

      {bets.map(bet => (
        <div key={bet.id} style={panelCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div>
              <div style={panelCardTitle}>{bet.title}</div>
              <div style={panelCardSub}>vs {bet.with} · {bet.reward}</div>
            </div>
            <button onClick={() => setConfirmId(bet.id)} style={trashBtnStyle}><Trash2 size={13} /></button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[{ player: "You", done: bet.myDone }, { player: bet.with, done: bet.theirDone }].map((p, i) => (
              <div key={i} style={{
                flex: 1, padding: "8px", borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {p.done
                  ? <CheckCircle size={13} color="#7c9a7e" />
                  : <XCircle size={13} color="#b26a6a" />}
                <span style={{ fontSize: "12px", color: p.done ? "#7c9a7e" : "#a8a6a2" }}>{p.player}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#f5c842" }}>
            <Star size={9} /> Both complete: {bet.reward}
          </div>
        </div>
      ))}

      {/* Confirm delete */}
      {confirmId !== null && (
        <div style={miniOverlay} onClick={() => setConfirmId(null)}>
          <div style={miniSheet} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "28px", textAlign: "center", marginBottom: "10px" }}>🎯</div>
            <p style={{ color: "#f1efe9", fontWeight: 600, textAlign: "center", fontFamily: "Georgia, serif", fontSize: "16px", margin: "0 0 6px" }}>Cancel Bet?</p>
            <p style={{ color: "#a8a6a2", fontSize: "12px", textAlign: "center", margin: "0 0 18px" }}>No points will be awarded.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setConfirmId(null)} style={cancelBtnStyle}>Keep it</button>
              <button onClick={() => deleteBet(confirmId)} style={deleteBtnStyle}>Cancel Bet</button>
            </div>
          </div>
        </div>
      )}
    </PanelSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Gamified Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function GamifiedScreen({ onExit }: { onExit: () => void }) {
  const [panel, setPanel] = useState<"quests" | "bets" | null>(null);
  const [showHouseDetail, setShowHouseDetail] = useState(false);
  const [houseZooming, setHouseZooming] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Entrance animation
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleHouseClick = () => {
    setHouseZooming(true);
    setTimeout(() => {
      setHouseZooming(false);
      setShowHouseDetail(true);
    }, 550);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 35%, #1e2e20 0%, #1f2321 65%)",
      position: "relative",
      overflow: "hidden",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>
      {/* Ambient glows */}
      <div style={{
        position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
        width: "340px", height: "340px",
        background: "radial-gradient(circle, rgba(124,154,126,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)",
        width: "500px", height: "200px",
        background: "radial-gradient(ellipse, rgba(78,107,80,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Top-left: Quests + Bets pills, stacked ── */}
      <div style={{
        position: "absolute", top: "52px", left: "20px",
        display: "flex", flexDirection: "column", gap: "10px",
        zIndex: 10,
      }}>
        <TabPill icon={<Zap size={14} />}    label="Quests" onClick={() => setPanel("quests")} active={panel === "quests"} />
        <TabPill icon={<Target size={14} />} label="Bets"   onClick={() => setPanel("bets")}   active={panel === "bets"} />
      </div>

      {/* ── Top-right: profile avatar ── */}
      <div style={{
        position: "absolute", top: "52px", right: "20px",
        width: "46px", height: "46px", borderRadius: "50%",
        background: "linear-gradient(135deg, #7c9a7e, #4a6b4c)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px", fontWeight: 700, color: "#1f2321",
        boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
        zIndex: 10, cursor: "pointer",
        border: "2.5px solid rgba(124,154,126,0.4)",
      }}>
        A
      </div>

      {/* ── Centre content ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh",
        paddingBottom: "20px",
      }}>
        <p style={{ color: "#a8a6a2", fontSize: "12px", margin: "0 0 2px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Floor 1
        </p>
        <h1 style={{
          fontFamily: "Georgia, serif", fontSize: "30px",
          color: "#f1efe9", margin: "0 0 32px", textAlign: "center",
        }}>
          Your Home
        </h1>

        <HouseSVG onClick={handleHouseClick} zooming={houseZooming} />

        {/* Stats strip */}
        <div style={{
          display: "flex", gap: "20px", marginTop: "38px",
          background: "rgba(42,47,44,0.75)", backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRadius: "100px", padding: "12px 28px",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {[["⭐", "340 XP"], ["🍪", "1,200"], ["🏆", "8 Wins"]].map(([icon, val], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "15px" }}>{icon}</div>
              <div style={{ fontSize: "11px", color: "#a8a6a2", fontWeight: 600, marginTop: "2px" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Exit / Switch Mode button ── */}
      <button
        onClick={onExit}
        style={{
          position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(42,47,44,0.88)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "100px", color: "#a8a6a2",
          padding: "11px 24px", fontSize: "13px", fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          zIndex: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          fontFamily: "inherit", whiteSpace: "nowrap",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(124,154,126,0.15)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(42,47,44,0.88)")}
      >
        <ArrowLeft size={14} /> Switch Mode
      </button>

      {/* Panels */}
      {panel === "quests" && <SidequestsPanel onClose={() => setPanel(null)} />}
      {panel === "bets"   && <BetsPanel       onClose={() => setPanel(null)} />}

      {/* House detail */}
      {showHouseDetail && <HouseDetail onClose={() => setShowHouseDetail(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers & shared styles
// ─────────────────────────────────────────────────────────────────────────────
function TabPill({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "7px",
        background: active ? "rgba(124,154,126,0.2)" : "rgba(42,47,44,0.9)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${active ? "rgba(124,154,126,0.4)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "100px", color: active ? "#7c9a7e" : "#f1efe9",
        padding: "10px 18px", fontSize: "13px", fontWeight: 600,
        cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        fontFamily: "inherit", transition: "all 0.2s",
      }}
    >
      {icon}{label}
    </button>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return <div style={{ textAlign: "center", padding: "28px 0", color: "#a8a6a2", fontSize: "13px" }}>{text}</div>;
}

const iconBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%",
  width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
  color: "#a8a6a2", cursor: "pointer", flexShrink: 0, fontSize: "14px",
};
const panelCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "14px", marginBottom: "10px",
};
const panelCardTitle: React.CSSProperties = { fontSize: "14px", fontWeight: 600, color: "#f1efe9", marginBottom: "3px" };
const panelCardSub: React.CSSProperties = { fontSize: "11px", color: "#a8a6a2" };
const panelAddBtn: React.CSSProperties = {
  width: "100%", padding: "13px", borderRadius: "14px", border: "none",
  background: "#7c9a7e", color: "#1f2321", fontSize: "14px", fontWeight: 600,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  gap: "6px", marginBottom: "16px", fontFamily: "inherit",
};
const trashBtnStyle: React.CSSProperties = {
  background: "rgba(178,106,106,0.12)", border: "none", borderRadius: "8px",
  color: "#b26a6a", cursor: "pointer", padding: "6px 8px",
  display: "flex", alignItems: "center", flexShrink: 0,
};
const achieveChip: React.CSSProperties = {
  background: "rgba(245,200,66,0.1)", color: "#f5c842",
  borderRadius: "100px", padding: "3px 8px", fontSize: "10px",
};
const miniOverlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
  zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
};
const miniSheet: React.CSSProperties = {
  background: "#2a2f2c", borderRadius: "20px", padding: "24px",
  width: "100%", maxWidth: "320px", boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
};
const cancelBtnStyle: React.CSSProperties = {
  flex: 1, padding: "12px", borderRadius: "12px", border: "none",
  background: "rgba(255,255,255,0.06)", color: "#f1efe9",
  fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};
const deleteBtnStyle: React.CSSProperties = {
  flex: 1, padding: "12px", borderRadius: "12px", border: "none",
  background: "#b26a6a", color: "#fff",
  fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};