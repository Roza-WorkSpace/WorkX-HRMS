
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  ListTodo,
  CalendarDays,
  Clock,
} from "lucide-react";
import { whiteCardStyle } from "../App";

const TASK_STORAGE_KEY = "workx_tasks_v1";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const loadTasks = (initialTasks) => {
  try {
    const saved = localStorage.getItem(TASK_STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Unable to load tasks:", error);
  }

  return Array.isArray(initialTasks) ? initialTasks : [];
};

// Supports older tasks that only stored a single date.
const normalizeTask = (task) => {
  const oldDate = task.date || getToday();

  return {
    ...task,
    startDate: task.startDate || oldDate,
    deadlineDate: task.deadlineDate || oldDate,
    done: Boolean(task.done),
  };
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Not selected";

  const parts = dateValue.split("-");

  if (parts.length !== 3) return dateValue;

  const [year, month, day] = parts.map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function TasksPage({
  tasks: initialTasks = [],
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) {
  const [tasks, setTasks] = useState(() =>
    loadTasks(initialTasks).map(normalizeTask)
  );

  const [taskText, setTaskText] = useState("");
  const [startDate, setStartDate] = useState(getToday());
  const [deadlineDate, setDeadlineDate] = useState(getToday());
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isMobile, setIsMobile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Responsive screen detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save task data automatically
  useEffect(() => {
    try {
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new Event("workxTasksUpdated"));
    } catch (error) {
      console.error("Unable to save tasks:", error);
    }
  }, [tasks]);

  // Sync changes from another browser tab
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== TASK_STORAGE_KEY || !event.newValue) return;

      try {
        const updatedTasks = JSON.parse(event.newValue);

        if (Array.isArray(updatedTasks)) {
          setTasks(updatedTasks.map(normalizeTask));
        }
      } catch (error) {
        console.error("Unable to synchronize tasks:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Add task with a start date and deadline date
  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedText = taskText.trim();

    if (!trimmedText) {
      setErrorMessage("Please enter a task name.");
      return;
    }

    if (!startDate || !deadlineDate) {
      setErrorMessage("Please select both dates.");
      return;
    }

    if (startDate < getToday()) {
      setErrorMessage("Start date cannot be in the past.");
      return;
    }

    if (deadlineDate < startDate) {
      setErrorMessage("Deadline cannot be earlier than the start date.");
      return;
    }

    const newTask = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `task_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      text: trimmedText,
      startDate,
      deadlineDate,
      done: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((previous) => [newTask, ...previous]);

    if (typeof onAddTask === "function") {
      onAddTask(trimmedText, startDate, deadlineDate);
    }

    setTaskText("");
    setStartDate(getToday());
    setDeadlineDate(getToday());
  };

  // Complete or reactivate task
  const handleToggle = (taskId) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? { ...task, done: !task.done }
          : task
      )
    );

    if (typeof onToggleTask === "function") {
      onToggleTask(taskId);
    }
  };

  // Delete task
  const handleDelete = (taskId) => {
    setTasks((previous) =>
      previous.filter((task) => task.id !== taskId)
    );

    if (typeof onDeleteTask === "function") {
      onDeleteTask(taskId);
    }
  };

  // Calculate task status based on deadline
  const getTaskStatus = (task) => {
    if (task.done) return "Completed";

    const today = getToday();

    if (today < task.startDate) return "Not Started";
    if (today > task.deadlineDate) return "Overdue";
    if (today === task.deadlineDate) return "Due Today";

    return "In Progress";
  };

  const getStatusStyle = (task) => {
    const status = getTaskStatus(task);

    switch (status) {
      case "Completed":
        return {
          background: "#dcfce7",
          color: "#15803d",
        };

      case "Overdue":
        return {
          background: "#fee2e2",
          color: "#dc2626",
        };

      case "Due Today":
        return {
          background: "#fef3c7",
          color: "#b45309",
        };

      case "Not Started":
        return {
          background: "#f1f5f9",
          color: "#475569",
        };

      default:
        return {
          background: "#eff6ff",
          color: "#2563eb",
        };
    }
  };

  // Dynamic dashboard statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.done
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const overdueTasks = tasks.filter(
    (task) => getTaskStatus(task) === "Overdue"
  ).length;

  const completionPercentage =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  // Search and filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = String(task.text || "")
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const status = getTaskStatus(task);

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Active" && !task.done) ||
      (activeFilter === "Completed" && task.done) ||
      (activeFilter === "Overdue" && status === "Overdue");

    return matchesSearch && matchesFilter;
  });

  const statCardStyle = {
    ...whiteCardStyle,
    flex: "1 1 150px",
    minWidth: 0,
    padding: "18px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* HEADER AND TASK FORM */}
      <div
        style={{
          ...whiteCardStyle,
          backgroundColor: "#03091e",
          border: "1px solid #1e293b",
          color: "#ffffff",
          padding: isMobile ? "18px" : "24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: "20px",
            color: "#ffffff",
          }}
        >
          My Workspace Tasks
        </h2>

        <p
          style={{
            color: "#94a3b8",
            margin: 0,
            fontSize: "13px",
          }}
        >
          Manage your tasks, schedules, and deadlines.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "13px",
            marginTop: "20px",
          }}
        >
          {/* Task Name */}
          <input
            type="text"
            placeholder="Enter task name..."
            value={taskText}
            onChange={(event) => setTaskText(event.target.value)}
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 14px",
              borderRadius: "8px",
              border: "1px solid #334155",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "13.5px",
              outline: "none",
            }}
          />

          {/* Start and Deadline Dates */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <label
                style={{
                  display: "block",
                  color: "#cbd5e1",
                  fontSize: "12px",
                  marginBottom: "7px",
                }}
              >
                <CalendarDays
                  size={13}
                  style={{ verticalAlign: "middle", marginRight: "5px" }}
                />
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                min={getToday()}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setErrorMessage("");

                  if (event.target.value > deadlineDate) {
                    setDeadlineDate(event.target.value);
                  }
                }}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontSize: "13px",
                }}
              />
            </div>

            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <label
                style={{
                  display: "block",
                  color: "#cbd5e1",
                  fontSize: "12px",
                  marginBottom: "7px",
                }}
              >
                <CalendarDays
                  size={13}
                  style={{ verticalAlign: "middle", marginRight: "5px" }}
                />
                Deadline Date
              </label>

              <input
                type="date"
                value={deadlineDate}
                min={startDate || getToday()}
                onChange={(event) => {
                  setDeadlineDate(event.target.value);
                  setErrorMessage("");
                }}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Selected Range Preview */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#111c35",
              border: "1px solid #263653",
              color: "#cbd5e1",
              fontSize: "12px",
            }}
          >
            <CalendarDays
              size={14}
              style={{ verticalAlign: "middle", marginRight: "7px" }}
            />
            Selected period: <strong>{formatDate(startDate)}</strong>
            {" – "}
            <strong>{formatDate(deadlineDate)}</strong>
          </div>

          {errorMessage && (
            <p
              style={{
                margin: 0,
                color: "#fca5a5",
                fontSize: "12px",
              }}
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: isMobile ? "100%" : "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              padding: "11px 20px",
              backgroundColor: "#0066FF",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Add Task
          </button>
        </form>
      </div>

      {/* STATISTICS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={statCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              Total Tasks
            </span>
            <ListTodo size={19} color="#2563eb" />
          </div>
          <h2 style={{ margin: "12px 0 0", fontSize: "26px", color: "#0f172a" }}>
            {totalTasks}
          </h2>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              Pending
            </span>
            <Clock size={19} color="#d97706" />
          </div>
          <h2 style={{ margin: "12px 0 0", fontSize: "26px", color: "#d97706" }}>
            {pendingTasks}
          </h2>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              Completed
            </span>
            <CheckCircle2 size={19} color="#16a34a" />
          </div>
          <h2 style={{ margin: "12px 0 0", fontSize: "26px", color: "#16a34a" }}>
            {completedTasks}
          </h2>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              Overdue
            </span>
            <CalendarDays size={19} color="#dc2626" />
          </div>
          <h2 style={{ margin: "12px 0 0", fontSize: "26px", color: "#dc2626" }}>
            {overdueTasks}
          </h2>
        </div>
      </div>

      {/* COMPLETION PROGRESS */}
      <div style={{ ...whiteCardStyle, padding: "18px 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <strong style={{ color: "#0f172a", fontSize: "14px" }}>
            Overall Progress
          </strong>

          <strong style={{ color: "#2563eb", fontSize: "14px" }}>
            {completionPercentage}%
          </strong>
        </div>

        <div
          style={{
            width: "100%",
            height: "9px",
            background: "#e2e8f0",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${completionPercentage}%`,
              height: "100%",
              background: "#2563eb",
              borderRadius: "20px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <p style={{ color: "#64748b", fontSize: "12px", margin: "9px 0 0" }}>
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>

      {/* TASK LIST */}
      <div style={{ ...whiteCardStyle, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            gap: "14px",
            marginBottom: "18px",
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: "#0f172a", fontSize: "17px" }}>
              Task List
            </h3>
            <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "12px" }}>
              Tasks, start dates and deadlines
            </p>
          </div>

          <div
            style={{
              position: "relative",
              width: isMobile ? "100%" : "230px",
            }}
          >
            <Search
              size={16}
              color="#94a3b8"
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />

            <input
              type="text"
              placeholder="Search tasks..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px 10px 34px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          {["All", "Active", "Completed", "Overdue"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: "8px 13px",
                borderRadius: "7px",
                border:
                  activeFilter === filter
                    ? "1px solid #2563eb"
                    : "1px solid #e2e8f0",
                background:
                  activeFilter === filter ? "#eff6ff" : "#ffffff",
                color:
                  activeFilter === filter ? "#2563eb" : "#64748b",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {filter}
              {filter === "All" && ` (${totalTasks})`}
              {filter === "Active" && ` (${pendingTasks})`}
              {filter === "Completed" && ` (${completedTasks})`}
              {filter === "Overdue" && ` (${overdueTasks})`}
            </button>
          ))}
        </div>

        {/* TASK ITEMS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredTasks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "35px 15px",
                border: "1px dashed #cbd5e1",
                borderRadius: "10px",
              }}
            >
              <ListTodo
                size={30}
                color="#94a3b8"
                style={{ marginBottom: "10px" }}
              />

              <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
                {tasks.length === 0
                  ? "No tasks yet. Add your first task above."
                  : "No tasks match your search or filter."}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const statusStyle = getStatusStyle(task);
              const status = getTaskStatus(task);

              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: isMobile ? "wrap" : "nowrap",
                    padding: "14px 15px",
                    borderRadius: "10px",
                    border: "1px solid #f1f5f9",
                    backgroundColor: task.done ? "#f8fafc" : "#ffffff",
                    gap: "12px",
                  }}
                >
                  {/* TASK NAME AND DATE RANGE */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      minWidth: 0,
                      flex: "1 1 200px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(task.done)}
                      onChange={() => handleToggle(task.id)}
                      aria-label={`Complete ${task.text}`}
                      style={{
                        cursor: "pointer",
                        width: "17px",
                        height: "17px",
                        flexShrink: 0,
                        marginTop: "2px",
                        accentColor: "#2563eb",
                      }}
                    />

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          textDecoration: task.done ? "line-through" : "none",
                          color: task.done ? "#94a3b8" : "#0f172a",
                          wordBreak: "break-word",
                        }}
                      >
                        {task.text}
                      </div>

                      {/* BOTH DATES DISPLAYED */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        <CalendarDays size={14} />
                        <span>{formatDate(task.startDate)}</span>
                        <span>–</span>
                        <span>{formatDate(task.deadlineDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* STATUS AND DELETE */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      flexWrap: "wrap",
                      marginLeft: isMobile ? "29px" : 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "5px 9px",
                        borderRadius: "6px",
                        background: statusStyle.background,
                        color: statusStyle.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Delete ${task.text}`}
                      title="Delete task"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        background: "transparent",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "6px",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
