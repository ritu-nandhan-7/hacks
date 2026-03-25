import { useState } from "react";
import { HtmlBridge } from "./components/HtmlBridge";
import { useHtmlWithCss } from "./hooks/useHtmlWithCss";

export default function App() {
  const [screen, setScreen] = useState("login");

  const html = useHtmlWithCss(
    `/templates/${screen}.html`,
    `/templates/styles.css`
  );

  const [habits, setHabits] = useState([
    { name: "Drink water", done: false },
    { name: "Move your body", done: false },
  ]);

  const toggleHabit = (index: number) => {
    const updated = [...habits];
    updated[index].done = !updated[index].done;
    setHabits(updated);
  };

  const handleAction = (id: string) => {
    if (id === "go-choose") setScreen("choose");
    if (id === "go-minimal") setScreen("home");
    if (id === "go-gamified") alert("Gamified soon 🚀");

    if (id === "add-habit") addHabit();
  };

  const addHabit = () => {
    const name = prompt("New habit?");
    if (name) {
      setHabits([...habits, { name, done: false }]);
    }
  };

  return (
    <HtmlBridge htmlContent={html} onAction={handleAction}>
      {screen === "home" &&
        habits.map((h, i) => (
          <HabitItem
            key={i}
            name={h.name}
            done={h.done}
            toggle={() => toggleHabit(i)}
          />
      ))}
    </HtmlBridge>
  );
}

// ---------------- Habit Component ----------------

function HabitItem({
  name,
  done,
  toggle,
}: {
  name: string;
  done: boolean;
  toggle: () => void;
}) {
  return (
    <div className={`habit-item ${done ? "completed" : ""}`}>
      <div className="habit-left">
        <div
          className={`checkbox ${done ? "active" : ""}`}
          onClick={toggle}
        >
          {done ? "✓" : ""}
        </div>

        <div className="habit-text">{name}</div>
      </div>
    </div>
  );
}