import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { whiteCardStyle } from "../App";

export default function TasksPage({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) {
  const todayISO = new Date().toISOString().split("T")[0];
  const [taskText, setTaskText] = useState("");
  const [taskDate, setTaskDate] = useState(todayISO);

  // Track window width for mobile-only responsive styling
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    onAddTask(taskText, taskDate);
    setTaskText("");
    setTaskDate(todayISO);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Dark Styled Header Card */}
      <div
        style={{
          ...whiteCardStyle,
          backgroundColor: "#03091e",
          border: "1px solid #1e293b",
          color: "#ffffff",
        }}
      >
        <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", color: "#ffffff" }}>
          My Workspace Tasks
        </h2>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>
          Manage your daily checklist, deadlines, and active items.
        </p>

        {/* Task Form: Responsive/Wrapping applies ONLY when isMobile is true */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: "12px",
            marginTop: "20px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Add a new task..."
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            style={{
              flex: isMobile ? "1 1 200px" : 1,
              minWidth: "0",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #334155",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "13.5px",
              outline: "none",
            }}
          />
          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            style={{
              flex: isMobile ? "1 1 130px" : "0 0 auto",
              minWidth: "0",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #334155",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              color: "#334155",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              flex: isMobile ? "1 1 100%" : "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 18px",
              backgroundColor: "#0066FF",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> Add Task
          </button>
        </form>
      </div>

      {/* Task List Card */}
      <div style={whiteCardStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tasks.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", margin: "20px 0" }}>
              No tasks found.
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #f1f5f9",
                  backgroundColor: task.done ? "#f8fafc" : "#ffffff",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minWidth: "0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggleTask(task.id)}
                    style={{ cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      textDecoration: task.done ? "line-through" : "none",
                      color: task.done ? "#94a3b8" : "#0f172a",
                      wordBreak: "break-word",
                    }}
                  >
                    {task.text}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: task.tagBg,
                      color: task.tagColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.date}
                  </span>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}