import { useState } from "react";

function Habit({ name }: { name: string }) {
  const [cells, setCells] = useState(Array(28).fill(false));

  const toggle = (i: number) => {
    const updated = [...cells];
    updated[i] = !updated[i];
    setCells(updated);
  };

  return (
    <div className="habit">
      <div className="habit-header">
        <div className="habit-title">{name}</div>
      </div>

      <div className="grid">
        {cells.map((c: boolean, i: number) => (
          <div
            key={i}
            className={`cell ${c ? "active" : ""}`}
            onClick={() => toggle(i)}
          >
            {c ? "✓" : ""}
          </div>
        ))}
      </div>

      <div className="footer">Consistency over perfection</div>
    </div>
  );
}

export default Habit;