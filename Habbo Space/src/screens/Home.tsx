import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Navigation from "../components/Navigation";

type Habit = {
  name: string;
  emoji: string;
  done: boolean;
};

export default function HomeScreen({
  screen,
  setScreen,
  habits,
  onToggle,
  onBack,
}: {
  screen: string;
  setScreen: (s: string) => void;
  habits: Habit[];
  onToggle: (index: number) => void;
  onBack: () => void;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const completedCount = habits.filter(h => h.done).length;
  const total = habits.length;
  const progress = total > 0 ? completedCount / total : 0;

  return (
    <div style={{
      maxWidth: "500px",
      margin: "0 auto",
      padding: "0 16px 120px",
      minHeight: "100vh",
      background: "#1f2321",
      fontFamily: "inherit",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "48px 0 8px",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "#2a2f2c",
            border: "none",
            borderRadius: "50%",
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#a8a6a2",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#f1efe9";
            (e.currentTarget as HTMLElement).style.background = "#363b38";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "#a8a6a2";
            (e.currentTarget as HTMLElement).style.background = "#2a2f2c";
          }}
        >
          <ArrowLeft size={16} />
        </button>

        <button style={{
          background: "#2a2f2c",
          border: "none",
          borderRadius: "50%",
          width: "38px",
          height: "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#a8a6a2",
        }}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Header */}
      <div style={{ padding: "20px 0 24px", textAlign: "center" }}>
        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: "30px",
          color: "#f1efe9",
          margin: "0 0 6px",
        }}>
          Today
        </h1>
        <p style={{
          color: "#a8a6a2",
          fontSize: "13px",
          margin: "0 0 20px",
        }}>
          {today}
        </p>

        {/* Progress bar (only if habits exist) */}
        {total > 0 && (
          <div>
            <div style={{
              height: "5px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "100px",
              overflow: "hidden",
              marginBottom: "8px",
            }}>
              <div style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: progress === 1
                  ? "linear-gradient(90deg, #7c9a7e, #9ab89c)"
                  : "#7c9a7e",
                borderRadius: "100px",
                transition: "width 0.4s ease",
              }} />
            </div>
            <p style={{
              color: "#a8a6a2",
              fontSize: "12px",
              margin: 0,
            }}>
              {completedCount === total && total > 0
                ? "✦ All done. That's enough."
                : `${completedCount} of ${total} done`}
            </p>
          </div>
        )}
      </div>

      {/* Habits list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {habits.length === 0 ? (
          <EmptyState onAdd={() => setScreen("addHabit")} />
        ) : (
          habits.map((habit, i) => (
            <HabitRow
              key={i}
              habit={habit}
              onToggle={() => onToggle(i)}
            />
          ))
        )}
      </div>

      {/* Add habit button */}
      {habits.length > 0 && (
        <button
          onClick={() => setScreen("addHabit")}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            border: "1px dashed rgba(255,255,255,0.12)",
            background: "transparent",
            color: "#a8a6a2",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            marginTop: "10px",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,154,126,0.4)";
            (e.currentTarget as HTMLElement).style.color = "#7c9a7e";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
            (e.currentTarget as HTMLElement).style.color = "#a8a6a2";
          }}
        >
          + Add Habit
        </button>
      )}

      <Navigation screen={screen} setScreen={setScreen} />
    </div>
  );
}

function HabitRow({ habit, onToggle }: { habit: Habit; onToggle: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        background: "#2a2f2c",
        padding: "16px 18px",
        borderRadius: "18px",
        transition: "all 0.2s ease",
        cursor: "pointer",
        opacity: habit.done ? 0.65 : 1,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div style={{
        width: "22px",
        height: "22px",
        borderRadius: "7px",
        border: habit.done ? "none" : "1.5px solid rgba(255,255,255,0.2)",
        background: habit.done ? "#7c9a7e" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.2s ease",
        color: "#1f2321",
        fontSize: "12px",
        fontWeight: 700,
      }}>
        {habit.done && "✓"}
      </div>

      {/* Emoji */}
      <span style={{ fontSize: "20px", flexShrink: 0 }}>{habit.emoji}</span>

      {/* Name */}
      <span style={{
        fontSize: "15px",
        color: "#f1efe9",
        flex: 1,
        textDecoration: habit.done ? "line-through" : "none",
        transition: "all 0.2s ease",
      }}>
        {habit.name}
      </span>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "48px 24px",
    }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>🌱</div>
      <p style={{
        fontFamily: "Georgia, serif",
        fontSize: "18px",
        color: "#f1efe9",
        margin: "0 0 8px",
      }}>
        No habits yet
      </p>
      <p style={{
        color: "#a8a6a2",
        fontSize: "13px",
        margin: "0 0 28px",
        lineHeight: 1.6,
      }}>
        Start small. One habit changes everything.
      </p>
      <button
        onClick={onAdd}
        style={{
          padding: "14px 32px",
          borderRadius: "14px",
          border: "none",
          background: "#7c9a7e",
          color: "#1f2321",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 4px 20px rgba(124,154,126,0.35)",
        }}
      >
        Add Your First Habit
      </button>
    </div>
  );
}