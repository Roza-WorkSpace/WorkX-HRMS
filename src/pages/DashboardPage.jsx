import { useState, useEffect } from "react";
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
  Coffee,
} from "lucide-react";
import { whiteCardStyle } from "../App";
import {
  MetricCard,
  LegendItem,
  EventRow,
} from "../components/DashboardComponents";

export default function DashboardPage({
  userProfile,
  navigate,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  leaveSummary,
}) {
  const [isClockedIn, setIsClockedIn] = useState(() => {
    const savedStatus = localStorage.getItem("workx_isClockedIn");
    return savedStatus ? JSON.parse(savedStatus) : false;
  });

  const [clockInTime, setClockInTime] = useState(() => {
    return localStorage.getItem("workx_clockInTime") || null;
  });

  const [clockOutTime, setClockOutTime] = useState(() => {
    return localStorage.getItem("workx_clockOutTime") || null;
  });

  const [isOnBreak, setIsOnBreak] = useState(() => {
    const savedBreak = localStorage.getItem("workx_isOnBreak");
    return savedBreak ? JSON.parse(savedBreak) : false;
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const savedRecords = localStorage.getItem("workx_attendance_records");
    if (savedRecords) return JSON.parse(savedRecords);
    return {
      "2026-10-01": { status: "present", time: "09:08 AM - 06:10 PM" },
      "2026-10-02": { status: "present", time: "09:12 AM - 06:01 PM" },
      "2026-10-05": { status: "present", time: "09:00 AM - 06:00 PM" },
      "2026-10-07": { status: "present", time: "09:15 AM - 06:00 PM" },
      "2026-10-12": { status: "present", time: "09:00 AM - 05:45 PM" },
    };
  });

  // Helper to sync approved leave history into attendance records automatically
  useEffect(() => {
    try {
      const savedLeaveHistory = localStorage.getItem("workx_leave_history_v4");
      if (savedLeaveHistory) {
        const leaveList = JSON.parse(savedLeaveHistory);
        setAttendanceRecords((prev) => {
          const updated = { ...prev };
          leaveList.forEach((leave) => {
            if (leave.status === "Approved") {
              // Parse dates like "07 Oct 2026" to YYYY-MM-DD
              const fromDateObj = new Date(leave.from);
              const toDateObj = new Date(leave.to);
              
              let curr = new Date(fromDateObj);
              while (curr <= toDateObj) {
                const dateKey = curr.toISOString().split("T")[0];
                updated[dateKey] = { status: "absent", time: leave.type };
                curr.setDate(curr.getDate() + 1);
              }
            }
          });
          return updated;
        });
      }
    } catch (e) {
      console.error("Error syncing leave history", e);
    }
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    localStorage.setItem("workx_isClockedIn", JSON.stringify(isClockedIn));
    localStorage.setItem("workx_isOnBreak", JSON.stringify(isOnBreak));
    if (clockInTime) {
      localStorage.setItem("workx_clockInTime", clockInTime);
    } else {
      localStorage.removeItem("workx_clockInTime");
    }
    if (clockOutTime) {
      localStorage.setItem("workx_clockOutTime", clockOutTime);
    } else {
      localStorage.removeItem("workx_clockOutTime");
    }
  }, [isClockedIn, clockInTime, clockOutTime, isOnBreak]);

  useEffect(() => {
    localStorage.setItem("workx_attendance_records", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Dynamic Events List
  const eventsData = [
    { id: 1, fullDate: "2026-10-02", displayDate: "02 Oct", title: "Gandhi Jayanti", isHoliday: true },
    { id: 2, fullDate: "2026-10-10", displayDate: "10 Oct", title: "Design Sync Session", isHoliday: false },
    { id: 3, fullDate: "2026-10-15", displayDate: "15 Oct", title: "Townhall Meeting", isHoliday: false },
    { id: 4, fullDate: "2026-10-20", displayDate: "20 Oct", title: "Q3 Product Review", isHoliday: false },
    { id: 5, fullDate: "2026-11-08", displayDate: "08 Nov", title: "Diwali Holiday", isHoliday: true },
    { id: 6, fullDate: "2026-12-25", displayDate: "25 Dec", title: "Christmas Day", isHoliday: true },
  ];

  const upcomingHoliday = eventsData.find((evt) => {
    const eventDate = new Date(evt.fullDate);
    eventDate.setHours(0, 0, 0, 0);
    return evt.isHoliday && eventDate >= today;
  }) || {
    title: "No Upcoming Holiday",
    displayDate: "-",
    fullDate: "",
  };

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formattedMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateKey: null,
    });
  }

  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      dateKey,
    });
  }

  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateKey: null,
    });
  }

  const handleClockToggle = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!isClockedIn) {
      setClockInTime(timeString);
      setClockOutTime(null);
      setIsClockedIn(true);
      setIsOnBreak(false);

      setAttendanceRecords((prev) => ({
        ...prev,
        [todayKey]: {
          status: "present",
          time: timeString,
        },
      }));
    } else {
      setClockOutTime(timeString);
      setIsClockedIn(false);
      setIsOnBreak(false);

      setAttendanceRecords((prev) => ({
        ...prev,
        [todayKey]: {
          status: "present",
          time: `${clockInTime || timeString} - ${timeString}`,
        },
      }));
    }
  };

  const handleBreakToggle = () => {
    setIsOnBreak((prev) => !prev);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText, newTaskDate);
    setNewTaskText("");
    setNewTaskDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner Box */}
      <div className="dashboard-banner">
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>
            Good Morning, <br />
            <span style={{ fontSize: "28px", color: "#0066FF" }}>
              {userProfile?.name?.trim() ? userProfile.name.split(" ")[0] : "User"} 👋
            </span>
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px" }}>
            Have a productive day at WorkX!
          </p>
        </div>

        <div className="clock-widget">
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
              {isClockedIn
                ? `Clocked in at ${clockInTime}`
                : clockOutTime
                ? `Clocked out at ${clockOutTime}`
                : "Not Clocked In"}
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: isOnBreak ? "#f59e0b" : isClockedIn ? "#16a34a" : "#dc2626",
              }}
            >
              {isOnBreak
                ? "Status: On Break ●"
                : isClockedIn
                ? "Status: Present ●"
                : "Status: Absent ●"}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {isClockedIn && (
              <button
                onClick={handleBreakToggle}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 14px",
                  backgroundColor: isOnBreak ? "#16a34a" : "#f59e0b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <Coffee size={16} />
                {isOnBreak ? "Back" : "Break"}
              </button>
            )}

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
      </div>

      {/* TOP METRIC CARDS */}
      <div className="metric-cards-grid">
        <MetricCard
          icon={CalendarCheck}
          iconBg="#eff6ff"
          iconColor="#0066FF"
          label="Today's Status"
          value={
            isOnBreak
              ? "On Break ●"
              : isClockedIn
              ? "Present ●"
              : "Not Clocked In ●"
          }
          sub={isClockedIn ? `Check-in ${clockInTime}` : "Awaiting Check-in"}
        />
        <MetricCard
          icon={Plane}
          iconBg="#eff6ff"
          iconColor="#0066FF"
          label="Leave Balance"
          value={`${leaveSummary?.overall?.remaining ?? 12} / ${leaveSummary?.overall?.total ?? 12} days`}
          sub={`${leaveSummary?.overall?.used ?? 0} Used`}
        />
        <MetricCard
          icon={Calendar}
          iconBg="#eff6ff"
          iconColor="#0066FF"
          label="Upcoming Holiday"
          value={upcomingHoliday.title}
          sub={
            upcomingHoliday.fullDate
              ? new Date(upcomingHoliday.fullDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-"
          }
        />
      </div>

      {/* MIDDLE ROW */}
      <div className="dashboard-three-col">
        {/* Attendance Calendar Card */}
        <div style={whiteCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>My Attendance</h3>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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

              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", minWidth: "100px", textAlign: "center" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", textAlign: "center", fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", textAlign: "center", fontSize: "12px" }}>
                {calendarDays.map((cell, idx) => {
                  const isCurrentToday =
                    cell.isCurrentMonth &&
                    cell.day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

                  const dayRecord = cell.dateKey ? attendanceRecords[cell.dateKey] : null;
                  const isPresent = dayRecord?.status === "present";
                  const isAbsent = dayRecord?.status === "absent";

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "6px 2px",
                        borderRadius: "10px",
                        backgroundColor: isPresent
                          ? "#dcfce7"
                          : isAbsent
                          ? "#fef2f2"
                          : isCurrentToday
                          ? "#eff6ff"
                          : "transparent",
                        color: !cell.isCurrentMonth ? "#cbd5e1" : "#1e293b",
                        border: isPresent
                          ? "1px solid #86efac"
                          : isAbsent
                          ? "1px solid #fecaca"
                          : isCurrentToday
                          ? "1px solid #bfdbfe"
                          : "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: "48px",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: isCurrentToday || isPresent ? "700" : "500",
                          fontSize: "12px",
                          color: isPresent ? "#15803d" : isCurrentToday ? "#0066FF" : "inherit",
                        }}
                      >
                        {cell.day < 10 ? `0${cell.day}` : cell.day}
                      </span>

                      {isPresent && (
                        <span
                          style={{
                            fontSize: "8.5px",
                            fontWeight: "700",
                            color: "#16a34a",
                            backgroundColor: "#bbf7d0",
                            padding: "1px 4px",
                            borderRadius: "4px",
                            marginTop: "2px",
                            textAlign: "center",
                          }}
                        >
                          Present
                        </span>
                      )}

                      {isAbsent && (
                        <span
                          style={{
                            fontSize: "8.5px",
                            fontWeight: "700",
                            color: "#dc2626",
                            backgroundColor: "#fecaca",
                            padding: "1px 4px",
                            borderRadius: "4px",
                            marginTop: "2px",
                            textAlign: "center",
                          }}
                        >
                          Absent
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="calendar-legend-box" style={{ textAlign: "left" }}>
              <LegendItem color="#22c55e" label="Present" count={Object.values(attendanceRecords).filter((r) => r.status === "present").length} />
              <LegendItem color="#f43f5e" label="On Leave / Absent" count={Object.values(attendanceRecords).filter((r) => r.status === "absent").length} />
            </div>
          </div>
        </div>

        {/* Dynamic Leave Balance Breakdown Card */}
        <div style={whiteCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>My Leave Balance</h3>
            <span style={{ fontSize: "12px", color: "#0066FF", fontWeight: "600", cursor: "pointer" }} onClick={() => navigate("leave")}>
              View All
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="leave-cards-grid">
              <div style={{ backgroundColor: "#eff6ff", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Plane size={16} color="#0066FF" />
                  <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>Casual Leave</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                  {leaveSummary?.casual?.remaining ?? 4} / {leaveSummary?.casual?.total ?? 4}
                </div>
                <span style={{ fontSize: "10px", color: "#64748b" }}>days left</span>
              </div>

              <div style={{ backgroundColor: "#fef2f2", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Heart size={16} color="#ef4444" />
                  <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>Sick Leave</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                  {leaveSummary?.sick?.remaining ?? 3} / {leaveSummary?.sick?.total ?? 3}
                </div>
                <span style={{ fontSize: "10px", color: "#64748b" }}>days left</span>
              </div>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "12px 14px", borderRadius: "10px", fontSize: "12px", color: "#64748b", border: "1px solid #f1f5f9" }}>
              <strong>Note:</strong> Total available leave balance auto-resets annually.
            </div>
          </div>
        </div>

        {/* Dynamic Events Column */}
        <div style={whiteCardStyle}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Events</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {eventsData.map((evt) => {
              const eventDate = new Date(evt.fullDate);
              eventDate.setHours(0, 0, 0, 0);
              const isPast = eventDate < today;

              return (
                <EventRow
                  key={evt.id}
                  date={evt.displayDate}
                  title={evt.title}
                  isPast={isPast}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="dashboard-two-col">
        {/* Editable Tasks List Card */}
        <div style={whiteCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>My Tasks</h3>
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
            <span onClick={() => navigate("tasks")} style={{ fontSize: "12px", color: "#0066FF", fontWeight: "600", cursor: "pointer" }}>
              View All
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "260px", overflowY: "auto" }}>
            {tasks.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", border: "1px solid #f1f5f9", backgroundColor: "#ffffff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input type="checkbox" checked={task.done} onChange={() => onToggleTask(task.id)} style={{ cursor: "pointer" }} />
                  <span style={{ fontSize: "13px", textDecoration: task.done ? "line-through" : "none", color: task.done ? "#94a3b8" : "#0f172a" }}>
                    {task.text}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px", backgroundColor: task.tagBg, color: task.tagColor }}>
                    {task.date}
                  </span>
                  <button onClick={() => onDeleteTask(task.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={whiteCardStyle}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Quick Actions</h3>

          <div className="quick-actions-grid">
            <button onClick={() => navigate("leave")} className="quick-action-btn" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Send size={16} />
                <span>Apply Leave</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button onClick={() => navigate("payslips")} className="quick-action-btn" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={16} />
                <span>View Payslip</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button onClick={() => navigate("attendance")} className="quick-action-btn" style={{ backgroundColor: "#f0fdf4", color: "#15803d" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CalendarCheck size={16} />
                <span>Attendance</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button onClick={() => navigate("profile")} className="quick-action-btn" style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={16} />
                <span>Edit Profile</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Add New Task</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Task Name
                </label>
                <input
                  type="text"
                  placeholder="Enter task description..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#0066FF", fontSize: "13px", fontWeight: "600", color: "#ffffff", cursor: "pointer" }}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}