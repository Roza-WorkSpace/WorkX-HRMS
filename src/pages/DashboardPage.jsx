import { useState } from "react";
import {
  CalendarCheck,
  Plane,
  Clock,
  Calendar,
  Heart,
  FileText,
  User,
  Plus,
  Trash2,
  X,
  Send,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { whiteCardStyle } from "../App";
import {
  MetricCard,
  LegendItem,
  LeaveMiniCard,
  EventRow,
} from "../components/DashboardComponents";

export default function DashboardPage({
  userProfile,
  navigate,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("Today");

  // Dynamic Month & Year Navigation State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026

  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const formattedMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calendar Grid Calculation Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full weeks (42 total grid cells)
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
    });
  }

  const handleClockToggle = () => {
    if (!isClockedIn) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setClockInTime(timeString);
      setIsClockedIn(true);
    } else {
      setIsClockedIn(false);
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText, newTaskDate);
    setNewTaskText("");
    setNewTaskDate("Today");
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner Box */}
      <div className="dashboard-banner">
        <div>
          <h2
            style={{
              margin: "0 0 6px 0",
              fontSize: "22px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            Good Morning, <br />
            <span style={{ fontSize: "28px", color: "#0066FF" }}>
              {userProfile?.name?.trim()
                ? userProfile.name.split(" ")[0]
                : "User"}{" "}
              👋
            </span>
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px" }}>
            Have a productive day at WorkX!
          </p>
        </div>

        <div className="clock-widget">
          <div style={{ textAlign: "right" }}>
            <div
              style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}
            >
              {isClockedIn ? `Clocked in at ${clockInTime}` : "Not Clocked In"}
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: isClockedIn ? "#16a34a" : "#dc2626",
              }}
            >
              {isClockedIn ? "Status: Present ●" : "Status: Absent ●"}
            </div>
          </div>

          <button
            onClick={handleClockToggle}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: isClockedIn ? "#ef4444" : "#0066FF",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <Clock size={16} />
            {isClockedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>
      </div>

      {/* TOP METRIC CARDS (3 Columns on Desktop) */}
      <div className="metric-cards-grid">
        <MetricCard
          icon={CalendarCheck}
          iconBg="#eff6ff"
          iconColor="#0066FF"
          label="Today's Status"
          value={isClockedIn ? "Present ●" : "Not Clocked In ●"}
          sub={isClockedIn ? `Check-in ${clockInTime}` : "Awaiting Check-in"}
        />
        <MetricCard
          icon={Plane}
          iconBg="#eff6ff"
          iconColor="#0066FF"
          label="Leave Balance"
          value="12 / 20 days"
          sub="10 Used"
        />
        <MetricCard
          icon={Calendar}
          iconBg="#eff6ff"
          iconColor="#0066FF"
          label="Upcoming Holiday"
          value="Gandhi Jayanti"
          sub="2 Oct 2026"
        />
      </div>

      {/* MIDDLE ROW: Attendance Calendar, Leave Balance & Events */}
      <div className="dashboard-three-col">
        {/* Attendance Calendar Card */}
        <div style={whiteCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
              My Attendance
            </h3>

            {/* Interactive Month Switcher aligned to the Right */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <button
                onClick={handlePrevMonth}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 6px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "#475569",
                }}
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  minWidth: "100px",
                  textAlign: "center",
                }}
              >
                {formattedMonthYear}
              </span>

              <button
                onClick={handleNextMonth}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 6px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "#475569",
                }}
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="attendance-calendar-grid">
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "6px",
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "6px",
                  textAlign: "center",
                  fontSize: "12px",
                }}
              >
                {calendarDays.map((cell, idx) => {
                  const isToday =
                    cell.isCurrentMonth &&
                    cell.day === 1 &&
                    month === 9 &&
                    year === 2026;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "6px 0",
                        borderRadius: "50%",
                        backgroundColor: isToday ? "#0066FF" : "transparent",
                        color: !cell.isCurrentMonth
                          ? "#cbd5e1"
                          : isToday
                          ? "#fff"
                          : "#1e293b",
                        fontWeight: isToday ? "700" : "500",
                      }}
                    >
                      {cell.day < 10 ? `0${cell.day}` : cell.day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="calendar-legend-box" style={{ textAlign: "left" }}>
              <LegendItem color="#22c55e" label="Present" count="18" />
              <LegendItem color="#3b82f6" label="Work From Home" count="4" />
              <LegendItem color="#f43f5e" label="On Leave" count="2" />
              <LegendItem color="#cbd5e1" label="Absent" count="1" />
            </div>
          </div>
        </div>

        {/* Leave Balance Breakdown */}
        <div style={whiteCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
              My Leave Balance
            </h3>
            <span
              style={{
                fontSize: "12px",
                color: "#0066FF",
                fontWeight: "600",
                cursor: "pointer",
              }}
              onClick={() => navigate("leave")}
            >
              View All
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="leave-cards-grid">
              <LeaveMiniCard
                icon={Plane}
                title="Casual Leave"
                count="6 / 8"
                bg="#eff6ff"
                iconColor="#0066FF"
              />
              <LeaveMiniCard
                icon={Heart}
                title="Sick Leave"
                count="4 / 6"
                bg="#fef2f2"
                iconColor="#ef4444"
              />
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "12px 14px",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#64748b",
                border: "1px solid #f1f5f9",
              }}
            >
              <strong>Note:</strong> Total available leave balance auto-resets
              annually.
            </div>
          </div>
        </div>

        {/* Events Column */}
        <div style={whiteCardStyle}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>
            Events
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <EventRow date="02 Oct" title="Gandhi Jayanti" />
            <EventRow date="10 Oct" title="Design Sync Session" />
            <EventRow date="15 Oct" title="Townhall Meeting" />
            <EventRow date="20 Oct" title="Q3 Product Review" />
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Tasks & Quick Actions */}
      <div className="dashboard-two-col">
        {/* Editable Tasks List Card */}
        <div style={whiteCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                My Tasks
              </h3>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#eff6ff",
                  color: "#0066FF",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} /> Add Task
              </button>
            </div>
            <span
              onClick={() => navigate("tasks")}
              style={{
                fontSize: "12px",
                color: "#0066FF",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              View All
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #f1f5f9",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggleTask(task.id)}
                    style={{ cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      textDecoration: task.done ? "line-through" : "none",
                      color: task.done ? "#94a3b8" : "#0f172a",
                    }}
                  >
                    {task.text}
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: task.tagBg,
                      color: task.tagColor,
                    }}
                  >
                    {task.date}
                  </span>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={whiteCardStyle}>
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "15px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            Quick Actions
          </h3>

          <div className="quick-actions-grid">
            <button
              onClick={() => navigate("leave")}
              className="quick-action-btn"
              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Send size={16} />
                <span>Apply Leave</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => navigate("payslips")}
              className="quick-action-btn"
              style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <FileText size={16} />
                <span>View Payslip</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => navigate("attendance")}
              className="quick-action-btn"
              style={{ backgroundColor: "#f0fdf4", color: "#15803d" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <CalendarCheck size={16} />
                <span>Attendance</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => navigate("profile")}
              className="quick-action-btn"
              style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <User size={16} />
                <span>Edit Profile</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}