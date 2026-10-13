import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Home,
  Clock,
  ChevronDown,
  X,
} from "lucide-react";

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026
  const [showAllLogsModal, setShowAllLogsModal] = useState(false);

  // DROPDOWN FILTER STATE
  const [summaryRange, setSummaryRange] = useState("This Month");
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);

  // Dynamic Month Navigation Handlers
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

  // Dynamic Calendar Grid Calculation
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // 1. Previous month leading days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        status: "other",
        isCurrentMonth: false,
      });
    }

    // 2. Current month days
    const today = new Date();
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;

      let status = "normal";
      let checkInTime = null;
      let wfhLabel = null;

      if (year === 2026 && month === 9) {
        if ([1, 5, 7, 12, 16, 26].includes(day)) status = "present";
        if (day === 15) status = "absent";
        if (day === 21) {
          status = "wfh";
          wfhLabel = "Work From Home";
        }
        if (day === 2) {
          status = "checkin";
          checkInTime = "09:12 AM";
        }
        if (day === 24) status = "today";
      } else if (isToday) {
        status = "today";
      }

      days.push({
        day,
        status,
        checkInTime,
        wfhLabel,
        isCurrentMonth: true,
      });
    }

    // 3. Next month trailing days
    const remainingGridCells = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let day = 1; day <= remainingGridCells; day++) {
      days.push({
        day,
        status: "other",
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Helper function to resolve dynamic tile styles based on status
  const getTileStyles = (item) => {
    if (!item.isCurrentMonth) {
      return {
        backgroundColor: "#fafafa",
        border: "1px solid #f1f5f9",
      };
    }

    switch (item.status) {
      case "present":
        return {
          backgroundColor: "#ecfdf5",
          border: "1px solid #a7f3d0",
        };
      case "absent":
        return {
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
        };
      case "wfh":
        return {
          backgroundColor: "#f3e8ff",
          border: "1px solid #e9d5ff",
        };
      case "checkin":
      case "today":
        return {
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
        };
      default:
        return {
          backgroundColor: "#ffffff",
          border: "1px solid #f1f5f9",
        };
    }
  };

  // Dynamic Attendance Summary Metrics Dataset
  const summaryMetricsMap = {
    "This Month": { present: "20", absent: "0", wfh: "3", total: "23" },
    "Last Month": { present: "21", absent: "1", wfh: "2", total: "24" },
  };

  const activeMetrics = summaryMetricsMap[summaryRange] || summaryMetricsMap["This Month"];

  const summaryCards = [
    {
      title: "Present",
      value: activeMetrics.present,
      unit: "days",
      icon: CheckCircle2,
      bgColor: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      title: "Absent",
      value: activeMetrics.absent,
      unit: "days",
      icon: XCircle,
      bgColor: "#fef2f2",
      iconColor: "#ef4444",
    },
    {
      title: "Work From Home",
      value: activeMetrics.wfh,
      unit: "days",
      icon: Home,
      bgColor: "#f3e8ff",
      iconColor: "#a855f7",
    },
    {
      title: "Total Working Days",
      value: activeMetrics.total,
      unit: "days",
      icon: Clock,
      bgColor: "#eff6ff",
      iconColor: "#3b82f6",
    },
  ];

  // Expanded Punch Logs List
  const allLogs = [
    { date: "02 Oct 2026", day: "Thursday", time: "09:12 AM - 06:01 PM", duration: "8h 49m", type: "present" },
    { date: "01 Oct 2026", day: "Wednesday", time: "09:08 AM - 06:10 PM", duration: "9h 02m", type: "present" },
    { date: "30 Sep 2026", day: "Tuesday", time: "09:15 AM - 06:00 PM", duration: "8h 45m", type: "present" },
    { date: "29 Sep 2026", day: "Monday", time: "09:21 AM - 06:05 PM", duration: "8h 44m", type: "present" },
    { date: "26 Sep 2026", day: "Friday", time: "Work From Home", duration: "-", type: "wfh" },
    { date: "25 Sep 2026", day: "Thursday", time: "09:10 AM - 06:00 PM", duration: "8h 50m", type: "present" },
    { date: "24 Sep 2026", day: "Wednesday", time: "09:05 AM - 06:15 PM", duration: "9h 10m", type: "present" },
  ];

  const recentLogs = allLogs.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* INJECTED MOBILE RESPONSIVE STYLES */}
      <style>{`
        .attendance-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        .calendar-header-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .calendar-tile {
          min-height: 82px;
          border-radius: 12px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease-in-out;
        }

        .calendar-tile-status {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 6px;
          border-radius: 6px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
          word-break: break-word;
        }

        .attendance-legend-container {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          font-size: 12px;
          color: #64748b;
        }

        .summary-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 868px) {
          .attendance-main-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .calendar-header-container {
            justify-content: center !important;
          }

          .calendar-header-nav {
            width: 100%;
            justify-content: center;
          }

          .attendance-calendar-card {
            padding: 14px !important;
          }

          .calendar-grid-container {
            gap: 4px !important;
          }

          .calendar-tile {
            min-height: 60px !important;
            padding: 4px !important;
            border-radius: 8px !important;
          }

          .calendar-tile-status {
            font-size: 8px !important;
            padding: 2px 2px !important;
            border-radius: 4px !important;
            line-height: 1.1;
          }

          .attendance-legend-container {
            gap: 12px !important;
            flex-wrap: wrap !important;
            font-size: 11px !important;
            justify-content: center;
          }

          .summary-cards-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .calendar-tile {
            min-height: 52px !important;
            padding: 2px !important;
          }

          .day-number-text {
            font-size: 11px !important;
          }

          .calendar-tile-status {
            font-size: 7.5px !important;
            padding: 1px !important;
          }

          .summary-cards-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>

      {/* DARK BANNER HEADER WITHOUT BUTTON */}
      <div
        style={{
          backgroundColor: "#080e1e",
          borderRadius: "16px",
          padding: "24px 28px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#ffffff", margin: "0 0 6px 0" }}>
          Attendance
        </h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
          View your attendance, working hours and leaves.
        </p>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="attendance-main-grid">
        
        {/* LEFT COLUMN: CALENDAR BOARD */}
        <div
          className="attendance-calendar-card"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          {/* CALENDAR NAVIGATION CONTROLS */}
          <div
            className="calendar-header-container"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
          >
            <div className="calendar-header-nav">
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                <ChevronLeft size={18} />
              </button>
              
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 8px", textAlign: "center", minWidth: "140px" }}>
                {formattedMonthYear}
              </h2>

              <button
                onClick={handleNextMonth}
                title="Next Month"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* WEEKDAY HEADERS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: "500",
              color: "#64748b",
              marginBottom: "12px",
            }}
          >
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          {/* SYNCHRONIZED CALENDAR GRID */}
          <div className="calendar-grid-container" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
            {calendarDays.map((item, index) => {
              const isOtherMonth = !item.isCurrentMonth;
              const isToday = item.status === "today";
              const tileStyles = getTileStyles(item);

              return (
                <div
                  key={index}
                  className="calendar-tile"
                  style={{
                    backgroundColor: tileStyles.backgroundColor,
                    border: tileStyles.border,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <span
                      className="day-number-text"
                      style={{
                        fontSize: "14px",
                        fontWeight: isToday ? "700" : "500",
                        color: isOtherMonth ? "#cbd5e1" : isToday ? "#0066FF" : "#1e293b",
                        width: isToday ? "24px" : "auto",
                        height: isToday ? "24px" : "auto",
                        borderRadius: isToday ? "50%" : "0",
                        backgroundColor: isToday ? "#dbeafe" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.day}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    {item.status === "present" && (
                      <div
                        className="calendar-tile-status"
                        style={{
                          backgroundColor: "#d1fae5",
                          color: "#047857",
                        }}
                      >
                        Present
                      </div>
                    )}
                    {item.status === "absent" && (
                      <div
                        className="calendar-tile-status"
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#b91c1c",
                        }}
                      >
                        Absent
                      </div>
                    )}
                    {item.status === "wfh" && (
                      <div
                        className="calendar-tile-status"
                        style={{
                          backgroundColor: "#e9d5ff",
                          color: "#7e22ce",
                        }}
                      >
                        {item.wfhLabel}
                      </div>
                    )}
                    {item.status === "checkin" && (
                      <div
                        className="calendar-tile-status"
                        style={{
                          backgroundColor: "#0066FF",
                          color: "#ffffff",
                          fontWeight: "500",
                        }}
                      >
                        Check In {item.checkInTime}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CALENDAR LEGEND FOOTER */}
          <div className="attendance-legend-container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981", flexShrink: 0 }} />
              <span>Present</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444", flexShrink: 0 }} />
              <span>Absent</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#a855f7", flexShrink: 0 }} />
              <span>Work From Home</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#0066FF", flexShrink: 0 }} />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY CARDS & RECENT LOGS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* SUMMARY CARDS CONTAINER */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Attendance Summary
              </h3>

              {/* FUNCTIONAL SUMMARY DROPDOWN */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setIsRangeDropdownOpen((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    cursor: "pointer",
                  }}
                >
                  {summaryRange} <ChevronDown size={14} />
                </button>

                {/* DROPDOWN MENU PANEL */}
                {isRangeDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      right: 0,
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      width: "130px",
                      zIndex: 50,
                      overflow: "hidden",
                    }}
                  >
                    {["This Month", "Last Month"].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setSummaryRange(range);
                          setIsRangeDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: "12px",
                          textAlign: "left",
                          border: "none",
                          backgroundColor: summaryRange === range ? "#eff6ff" : "transparent",
                          color: summaryRange === range ? "#0066FF" : "#334155",
                          fontWeight: summaryRange === range ? "600" : "400",
                          cursor: "pointer",
                          display: "block",
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="summary-cards-grid">
              {summaryCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: "12px",
                      padding: "14px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: card.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={20} color={card.iconColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px", fontWeight: "500" }}>
                        {card.title}
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", lineHeight: "1.2" }}>
                        {card.value}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{card.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECENT LOGS CONTAINER */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Recent Logs
              </h3>

              <button
                onClick={() => setShowAllLogsModal(true)}
                style={{
                  fontSize: "12px",
                  color: "#0066FF",
                  fontWeight: "600",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                View All
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: index !== recentLogs.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: log.type === "wfh" ? "#a855f7" : "#10b981",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{log.date}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{log.day}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: log.type === "wfh" ? "#a855f7" : "#334155" }}>
                      {log.time}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{log.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW ALL RECENT LOGS MODAL */}
      {showAllLogsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "500px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  All Attendance Logs
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                  Detailed punch records for the active period
                </p>
              </div>
              <button
                onClick={() => setShowAllLogsModal(false)}
                style={{
                  backgroundColor: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {allLogs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "10px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: log.type === "wfh" ? "#a855f7" : "#10b981",
                        }}
                      />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{log.date}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{log.day}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: log.type === "wfh" ? "#a855f7" : "#334155",
                        }}
                      >
                        {log.time}
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{log.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}