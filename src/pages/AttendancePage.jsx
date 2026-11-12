import React, { useEffect, useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  X,
  Play,
  Pause,
  LogOut,
  Coffee,
} from "lucide-react";

const FESTIVAL_HOLIDAYS = {
  // Festival holidays only (dates configured for the attendance calendar)
  "2026-01-14": { name: "Makar Sankranti", emoji: "🪁", color: "#ea580c" },
  "2026-01-23": { name: "Basanta Panchami", emoji: "🌼", color: "#ca8a04" },
  "2026-03-03": { name: "Dola Purnima", emoji: "🎨", color: "#db2777" },
  "2026-03-04": { name: "Holi", emoji: "🎨", color: "#ec4899" },
  "2026-03-27": { name: "Rama Navami", emoji: "🏹", color: "#ea580c" },
  "2026-04-14": {
    name: "Maha Visuba Sankranti",
    emoji: "🌞",
    color: "#ea580c",
  },
  "2026-05-01": { name: "Budha Purnima", emoji: "🪷", color: "#7c3aed" },
  "2026-05-16": { name: "Sabitri Amabasya", emoji: "🙏", color: "#db2777" },
  "2026-06-15": { name: "Raja Sankranti", emoji: "🌺", color: "#db2777" },
  "2026-07-16": { name: "Ratha Yatra", emoji: "🛕", color: "#ea580c" },
  "2026-09-04": { name: "Janmashtami", emoji: "🦚", color: "#2563eb" },
  "2026-09-14": { name: "Ganesh Puja", emoji: "🐘", color: "#ea580c" },
  "2026-09-15": { name: "Nuakhai", emoji: "🌾", color: "#16a34a" },
  "2026-09-16": { name: "Nuakhai Holiday", emoji: "🌾", color: "#16a34a" },
  "2026-10-17": { name: "Maha Saptami", emoji: "🌺", color: "#db2777" },
  "2026-10-19": { name: "Maha Navami", emoji: "🔱", color: "#dc2626" },
  "2026-10-20": { name: "Vijaya Dashami", emoji: "🏹", color: "#ea580c" },
  "2026-12-25": { name: "Christmas", emoji: "🎄", color: "#16a34a" },
  "2027-01-14": { name: "Makar Sankranti", emoji: "🪁", color: "#ea580c" },
  "2027-02-11": { name: "Basanta Panchami", emoji: "🌼", color: "#ca8a04" },
  "2027-03-06": { name: "Maha Shivaratri", emoji: "🔱", color: "#7c3aed" },
  "2027-03-22": { name: "Dola Purnima", emoji: "🎨", color: "#db2777" },
  "2027-03-23": { name: "Holi", emoji: "🎨", color: "#ec4899" },
  "2027-04-15": { name: "Rama Navami", emoji: "🏹", color: "#ea580c" },
  "2027-05-20": { name: "Budha Jayanti", emoji: "🪷", color: "#7c3aed" },
  "2027-06-04": { name: "Sabitri Amabasya", emoji: "🙏", color: "#db2777" },
  "2027-06-14": { name: "Pahili Raja", emoji: "🌺", color: "#db2777" },
  "2027-06-15": { name: "Raja Sankranti", emoji: "🌺", color: "#db2777" },
  "2027-07-05": { name: "Ratha Yatra", emoji: "🛕", color: "#ea580c" },
  "2027-08-17": { name: "Jhulana Purnima", emoji: "🌸", color: "#db2777" },
  "2027-08-24": { name: "Janmashtami", emoji: "🦚", color: "#2563eb" },
  "2027-09-04": { name: "Ganesh Puja", emoji: "🐘", color: "#ea580c" },
  "2027-09-06": { name: "Nuakhai Holiday", emoji: "🌾", color: "#16a34a" },
  "2027-09-30": { name: "Mahalaya", emoji: "🙏", color: "#7c3aed" },
  "2027-10-06": { name: "Maha Saptami", emoji: "🌺", color: "#db2777" },
  "2027-10-07": { name: "Maha Ashtami", emoji: "🔱", color: "#dc2626" },
  "2027-10-08": { name: "Maha Navami", emoji: "🔱", color: "#dc2626" },
  "2027-10-15": { name: "Kumar Purnima", emoji: "🌕", color: "#7c3aed" },
  "2027-10-29": { name: "Diwali", emoji: "🪔", color: "#f97316" },
};

const ATTENDANCE_KEY = "workx_attendance_records";

const LEAVE_KEY = "workx_leave_history_v4";

const ATTENDANCE_EVENT = "workxAttendanceUpdated";

const LEAVE_EVENT = "leaveHistoryUpdated";

const WORK_TARGET_MS = 8 * 60 * 60 * 1000;

const BREAK_TARGET_MS = 60 * 60 * 1000;

const pad = (value) => String(value).padStart(2, "0");

const getDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDateKey = (key) => new Date(`${key}T00:00:00`);

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",

    minute: "2-digit",
  });
};

const formatWorkTime = (milliseconds) => {
  const minutes = Math.floor(Math.max(0, milliseconds) / 60000);

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
};

const getBreakMilliseconds = (record, now = new Date()) => {
  if (!record) return 0;

  const completedBreaks = (record.breaks || []).reduce(
    (total, item) => {
      if (!item.start || !item.end) return total;

      const start = new Date(item.start).getTime();

      const end = new Date(item.end).getTime();

      return total + Math.max(0, end - start);
    },

    0,
  );

  const activeBreak = record.activeBreakStart
    ? Math.max(
        0,

        now.getTime() - new Date(record.activeBreakStart).getTime(),
      )
    : 0;

  return completedBreaks + activeBreak;
};

const getWorkedMilliseconds = (record, now = new Date()) => {
  if (!record?.checkIn) return 0;

  const start = new Date(record.checkIn).getTime();

  const end = record.checkOut
    ? new Date(record.checkOut).getTime()
    : now.getTime();

  return Math.max(
    0,

    end - start - getBreakMilliseconds(record, now),
  );
};

const buildTimeLabel = (record) => {
  if (!record) return "-";

  if (record.status === "absent") {
    return record.time || "On Leave";
  }

  const checkIn = record.checkIn ? formatTime(record.checkIn) : "";

  const checkOut = record.checkOut ? formatTime(record.checkOut) : "";

  if (checkIn && checkOut) return `${checkIn} - ${checkOut}`;

  if (checkIn) return `${checkIn} - In progress`;

  return record.time || "-";
};

const getStoredRecords = () => {
  try {
    const saved = localStorage.getItem(ATTENDANCE_KEY);

    if (!saved) return {};

    const parsed = JSON.parse(saved);

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch (error) {
    console.error("Unable to read attendance records:", error);

    return {};
  }
};

const getApprovedLeaveRecords = (baseRecords) => {
  let leaveList = [];

  try {
    const savedLeaves = localStorage.getItem(LEAVE_KEY);

    leaveList = savedLeaves ? JSON.parse(savedLeaves) : [];
  } catch (error) {
    console.error("Unable to read leave history:", error);
  }

  const updated = { ...baseRecords };

  Object.keys(updated).forEach((key) => {
    if (updated[key]?.source === "leave") {
      delete updated[key];
    }
  });

  (Array.isArray(leaveList) ? leaveList : []).forEach((leave) => {
    if (leave.status !== "Approved" || !leave.from || !leave.to) return;

    const start = new Date(`${String(leave.from).slice(0, 10)}T00:00:00`);

    const end = new Date(`${String(leave.to).slice(0, 10)}T00:00:00`);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      return;
    }

    const current = new Date(start);

    while (current <= end) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        const key = getDateKey(current);

        if (!updated[key] || updated[key].source === "leave") {
          updated[key] = {
            status: "absent",

            time: leave.type || "Approved Leave",

            source: "leave",

            leaveId: leave.id ?? null,
          };
        }
      }

      current.setDate(current.getDate() + 1);
    }
  });

  return updated;
};

const getWorkingDays = (startDate, endDate) => {
  let count = 0;

  const current = new Date(startDate);

  while (current <= endDate) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      count += 1;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
};

const getSummaryRangeDates = (range, referenceDate) => {
  const year = referenceDate.getFullYear();

  const month = referenceDate.getMonth();

  if (range === "Last Month") {
    return {
      start: new Date(year, month - 1, 1),

      end: new Date(year, month, 0),
    };
  }

  if (range === "This Year") {
    return {
      start: new Date(year, 0, 1),

      end: new Date(year, 11, 31),
    };
  }

  return {
    start: new Date(year, month, 1),

    end: new Date(year, month + 1, 0),
  };
};

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [clockNow, setClockNow] = useState(() => new Date());

  const [showAllLogsModal, setShowAllLogsModal] = useState(false);

  const [summaryRange, setSummaryRange] = useState("This Month");

  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    if (typeof window === "undefined") return {};

    return getApprovedLeaveRecords(getStoredRecords());
  });

  const todayKey = getDateKey(clockNow);

  const todayRecord = attendanceRecords[todayKey] || null;

  const isClockedIn = Boolean(todayRecord?.checkIn) && !todayRecord?.checkOut;

  const isOnBreak = Boolean(todayRecord?.activeBreakStart);

  const isClockedOut = Boolean(todayRecord?.checkOut);

  const workedMilliseconds = getWorkedMilliseconds(todayRecord, clockNow);

  const breakMilliseconds = getBreakMilliseconds(todayRecord, clockNow);

  const remainingMilliseconds = Math.max(
    0,

    WORK_TARGET_MS - workedMilliseconds,
  );

  const workProgress = Math.min(
    100,

    (workedMilliseconds / WORK_TARGET_MS) * 100,
  );

  const breakProgress = Math.min(
    100,

    (breakMilliseconds / BREAK_TARGET_MS) * 100,
  );

  // Save attendance, update dashboard localStorage keys, and notify other WorkX components.
  useEffect(() => {
    try {
      localStorage.setItem(
        ATTENDANCE_KEY,

        JSON.stringify(attendanceRecords),
      );

      // Sync dashboard state keys for dashboard/attendance cross-compatibility
      if (todayRecord?.checkIn) {
        localStorage.setItem("workx_isClockedIn", JSON.stringify(isClockedIn));
        localStorage.setItem(
          "workx_clockInTime",
          JSON.stringify(formatTime(todayRecord.checkIn)),
        );
      } else {
        localStorage.setItem("workx_isClockedIn", JSON.stringify(false));
        localStorage.removeItem("workx_clockInTime");
      }

      if (todayRecord?.checkOut) {
        localStorage.setItem(
          "workx_clockOutTime",
          JSON.stringify(formatTime(todayRecord.checkOut)),
        );
      } else {
        localStorage.removeItem("workx_clockOutTime");
      }

      localStorage.setItem("workx_isOnBreak", JSON.stringify(isOnBreak));

      window.dispatchEvent(new Event(ATTENDANCE_EVENT));
    } catch (error) {
      console.error("Unable to save attendance records:", error);
    }
  }, [attendanceRecords, todayRecord, isClockedIn, isOnBreak, isClockedOut]);

  // Update the clock every second.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Synchronize attendance and approved leave.
  useEffect(() => {
    const syncData = () => {
      const latestRecords = getStoredRecords();

      setAttendanceRecords(getApprovedLeaveRecords(latestRecords));
    };

    window.addEventListener("storage", syncData);

    window.addEventListener(LEAVE_EVENT, syncData);
    window.addEventListener(ATTENDANCE_EVENT, syncData);

    return () => {
      window.removeEventListener("storage", syncData);

      window.removeEventListener(LEAVE_EVENT, syncData);
      window.removeEventListener(ATTENDANCE_EVENT, syncData);
    };
  }, []);

  // Clock In.
  const handleClockIn = () => {
    const now = new Date().toISOString();

    setAttendanceRecords((previous) => {
      const existing = previous[todayKey];

      if (existing?.checkIn) return previous;

      return {
        ...previous,

        [todayKey]: {
          ...existing,

          status: "present",

          checkIn: now,

          checkOut: null,

          breaks: [],

          activeBreakStart: null,

          source: "attendance",
        },
      };
    });
  };

  // Start break.
  const handleBreakStart = () => {
    if (!isClockedIn || isOnBreak) return;

    setAttendanceRecords((previous) => ({
      ...previous,

      [todayKey]: {
        ...previous[todayKey],

        activeBreakStart: new Date().toISOString(),
      },
    }));
  };

  // End break.
  const handleBreakEnd = () => {
    if (!isOnBreak) return;

    const now = new Date().toISOString();

    setAttendanceRecords((previous) => {
      const record = previous[todayKey];

      return {
        ...previous,

        [todayKey]: {
          ...record,

          breaks: [
            ...(record.breaks || []),

            {
              start: record.activeBreakStart,

              end: now,
            },
          ],

          activeBreakStart: null,
        },
      };
    });
  };

  // Clock Out.
  const handleClockOut = () => {
    if (!isClockedIn) return;

    const now = new Date().toISOString();

    setAttendanceRecords((previous) => {
      const record = previous[todayKey];

      let breaks = record.breaks || [];

      if (record.activeBreakStart) {
        breaks = [
          ...breaks,

          {
            start: record.activeBreakStart,

            end: now,
          },
        ];
      }

      return {
        ...previous,

        [todayKey]: {
          ...record,

          status: "present",

          checkOut: now,

          breaks,

          activeBreakStart: null,
        },
      };
    });
  };

  // Calendar navigation.
  const handlePrevMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + 1, 1),
    );
  };

  const formattedMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",

    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let index = firstDay - 1; index >= 0; index--) {
      days.push({
        day: daysInPrevMonth - index,

        status: "other",

        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;

      const isToday = dateKey === todayKey;

      const record = attendanceRecords[dateKey];

      let status = "normal";

      if (record?.status === "present") status = "present";
      else if (record?.status === "absent") status = "absent";
      else if (isToday) status = "today";

      days.push({
        day,

        status,

        dateKey,

        record,

        isCurrentMonth: true,
      });
    }

    const remaining = days.length <= 35 ? 35 - days.length : 42 - days.length;

    for (let day = 1; day <= remaining; day++) {
      days.push({
        day,

        status: "other",

        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate, attendanceRecords, todayKey]);

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

  // Summary calculations.
  const summaryDates = getSummaryRangeDates(summaryRange, clockNow);

  const summaryRecords = Object.entries(attendanceRecords).filter(
    ([dateKey]) => {
      const date = parseDateKey(dateKey);

      return date >= summaryDates.start && date <= summaryDates.end;
    },
  );

  const presentDaysCount = summaryRecords.filter(
    ([, record]) => record.status === "present",
  ).length;

  const absentDaysCount = summaryRecords.filter(
    ([, record]) => record.status === "absent",
  ).length;

  const totalWorkingDays = getWorkingDays(
    summaryDates.start,

    summaryDates.end,
  );

  const summaryCards = [
    {
      title: "Present",

      value: String(presentDaysCount),

      unit: "days",

      icon: CheckCircle2,

      bgColor: "#ecfdf5",

      iconColor: "#10b981",
    },

    {
      title: "Absent / Leave",

      value: String(absentDaysCount),

      unit: "days",

      icon: XCircle,

      bgColor: "#fef2f2",

      iconColor: "#ef4444",
    },

    {
      title: "Total Working Days",

      value: String(totalWorkingDays),

      unit: "days",

      icon: Clock,

      bgColor: "#eff6ff",

      iconColor: "#3b82f6",
    },
  ];

  // Attendance logs.
  const allLogs = Object.entries(attendanceRecords)

    .map(([dateStr, data]) => {
      const date = parseDateKey(dateStr);

      const logNow =
        dateStr === todayKey
          ? clockNow
          : new Date(data.checkOut || data.checkIn || date);

      return {
        date: date.toLocaleDateString("en-GB", {
          day: "2-digit",

          month: "short",

          year: "numeric",
        }),

        dateKey: dateStr,

        day: date.toLocaleDateString("en-US", {
          weekday: "long",
        }),

        time: buildTimeLabel(data),

        duration:
          data.status === "absent"
            ? "On Leave"
            : data.checkIn
              ? formatWorkTime(getWorkedMilliseconds(data, logNow))
              : "-",

        type: data.status,
      };
    })

    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  const recentLogs = allLogs.slice(0, 5);

  return (
    <div className="attendance-page">
      <style>{`

        .attendance-page {

          display: flex;

          flex-direction: column;

          gap: 24px;

          min-width: 0;

          width: 100%;

        }



        .attendance-main-grid {

          display: grid;

          grid-template-columns: minmax(0, 1fr) 340px;

          gap: 24px;

          align-items: start;

          min-width: 0;

        }



        .calendar-header-nav {

          display: flex;

          align-items: center;

          gap: 12px;

        }



        .calendar-tile {

          min-width: 0;

          min-height: 82px;

          border-radius: 12px;

          padding: 8px;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

          box-sizing: border-box;

        }



        .calendar-tile-status {

          font-size: 10px;

          font-weight: 600;

          padding: 4px 6px;

          border-radius: 6px;

          text-align: center;

          width: 100%;

          box-sizing: border-box;

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

          flex-wrap: wrap;

        }



        .summary-cards-grid {

          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 12px;

        }



        .attendance-log-row,

        .attendance-log-details,

        .attendance-summary-card {

          min-width: 0;

        }



        .attendance-action-button {

          border: none;

          border-radius: 9px;

          padding: 11px 18px;

          font-size: 13px;

          font-weight: 600;

          color: white;

          cursor: pointer;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

        }



        .attendance-action-button:disabled {

          opacity: 0.5;

          cursor: not-allowed;

        }



        @media (max-width: 868px) {

          .attendance-main-grid {

            grid-template-columns: minmax(0, 1fr) !important;

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

            padding: 2px !important;

          }



          .attendance-legend-container {

            gap: 12px !important;

            justify-content: center;

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

            font-size: 7px !important;

            padding: 1px !important;

          }



          .summary-cards-grid {

            grid-template-columns: 1fr 1fr !important;

            gap: 8px !important;

          }



          .attendance-summary-card {

            padding: 14px !important;

          }



          .attendance-log-row {

            gap: 6px !important;

          }

        }



        @media (max-width: 360px) {

          .summary-cards-grid {

            grid-template-columns: 1fr !important;

          }

        }

      `}</style>

      {/* HEADER */}

      <div
        style={{
          backgroundColor: "#080e1e",

          borderRadius: "16px",

          padding: "24px 28px",

          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
        }}
      >
        <h1
          style={{
            fontSize: "22px",

            fontWeight: 700,

            color: "#fff",

            margin: "0 0 6px",
          }}
        >
          Attendance
        </h1>

        <p
          style={{
            fontSize: "14px",

            color: "#94a3b8",

            margin: 0,
          }}
        >
          View your attendance, working hours and leaves.
        </p>
      </div>

      {/* LIVE WORK SESSION */}

      <div
        style={{
          background: "#fff",

          border: "1px solid #e2e8f0",

          borderRadius: "16px",

          padding: "22px",

          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            gap: 12,

            flexWrap: "wrap",

            marginBottom: 20,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,

                color: "#0f172a",

                fontSize: 17,

                fontWeight: 700,
              }}
            >
              Today's Work Session
            </h3>

            <p
              style={{
                margin: "5px 0 0",

                color: "#64748b",

                fontSize: 12,
              }}
            >
              8 hours working time + 1 hour break
            </p>
          </div>

          <span
            style={{
              padding: "7px 12px",

              borderRadius: 20,

              fontSize: 12,

              fontWeight: 700,

              color: isOnBreak
                ? "#b45309"
                : isClockedIn
                  ? "#047857"
                  : isClockedOut
                    ? "#1d4ed8"
                    : "#64748b",

              background: isOnBreak
                ? "#fef3c7"
                : isClockedIn
                  ? "#d1fae5"
                  : isClockedOut
                    ? "#dbeafe"
                    : "#f1f5f9",
            }}
          >
            {isOnBreak
              ? "On Break"
              : isClockedIn
                ? "Present"
                : isClockedOut
                  ? "Clocked Out"
                  : "Not Clocked In"}
          </span>
        </div>

        <div
          style={{
            display: "grid",

            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",

            gap: 14,

            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Worked Hours",

              value: formatWorkTime(workedMilliseconds),

              color: "#0f172a",
            },

            {
              label: "Remaining Work Time",

              value:
                remainingMilliseconds === 0
                  ? "Completed"
                  : formatWorkTime(remainingMilliseconds),

              color: remainingMilliseconds === 0 ? "#059669" : "#2563eb",
            },

            {
              label: "Break Taken",

              value: formatWorkTime(breakMilliseconds),

              color: "#d97706",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#f8fafc",

                borderRadius: 12,

                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b" }}>{item.label}</div>

              <div
                style={{
                  fontSize: 25,

                  fontWeight: 700,

                  color: item.color,

                  marginTop: 7,

                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* WORK PROGRESS */}

        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              marginBottom: 8,

              fontSize: 12,

              color: "#64748b",
            }}
          >
            <span>8-hour work progress</span>

            <strong style={{ color: "#0f172a" }}>
              {Math.round(workProgress)}%
            </strong>
          </div>

          <div
            style={{
              height: 10,

              background: "#e2e8f0",

              borderRadius: 20,

              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${workProgress}%`,

                height: "100%",

                background: "#10b981",

                borderRadius: 20,

                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* BREAK PROGRESS */}

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              marginBottom: 8,

              fontSize: 12,

              color: "#64748b",
            }}
          >
            <span>1-hour break</span>

            <strong style={{ color: "#0f172a" }}>
              {Math.round(breakProgress)}%
            </strong>
          </div>

          <div
            style={{
              height: 8,

              background: "#e2e8f0",

              borderRadius: 20,

              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${breakProgress}%`,

                height: "100%",

                background: "#f59e0b",

                borderRadius: 20,
              }}
            />
          </div>
        </div>

        {/* PUNCH TIMES */}

        <div
          style={{
            display: "flex",

            gap: 20,

            flexWrap: "wrap",

            marginBottom: 20,

            fontSize: 12,

            color: "#64748b",
          }}
        >
          <span>
            Clock In:{" "}
            <strong style={{ color: "#0f172a" }}>
              {todayRecord?.checkIn ? formatTime(todayRecord.checkIn) : "--:--"}
            </strong>
          </span>

          <span>
            Clock Out:{" "}
            <strong style={{ color: "#0f172a" }}>
              {todayRecord?.checkOut
                ? formatTime(todayRecord.checkOut)
                : "--:--"}
            </strong>
          </span>
        </div>

        {/* BUTTONS */}

        <div
          style={{
            display: "flex",

            gap: 10,

            flexWrap: "wrap",
          }}
        >
          {!todayRecord?.checkIn && (
            <button
              className="attendance-action-button"
              onClick={handleClockIn}
              style={{ background: "#059669" }}
            >
              <Play size={15} /> Clock In
            </button>
          )}

          {isClockedIn && !isOnBreak && (
            <button
              className="attendance-action-button"
              onClick={handleBreakStart}
              style={{ background: "#f59e0b" }}
            >
              <Coffee size={15} /> Start Break
            </button>
          )}

          {isClockedIn && isOnBreak && (
            <button
              className="attendance-action-button"
              onClick={handleBreakEnd}
              style={{ background: "#059669" }}
            >
              <Play size={15} /> End Break
            </button>
          )}

          {isClockedIn && (
            <button
              className="attendance-action-button"
              onClick={handleClockOut}
              style={{ background: "#dc2626" }}
            >
              <LogOut size={15} /> Clock Out
            </button>
          )}
        </div>

        {isClockedOut && (
          <p
            style={{
              color: "#047857",

              fontSize: 12,

              margin: "14px 0 0",

              fontWeight: 600,
            }}
          >
            Attendance completed for today.
            {workedMilliseconds >= WORK_TARGET_MS
              ? " 8-hour work target completed!"
              : ` ${formatWorkTime(remainingMilliseconds)} of work time remaining.`}
          </p>
        )}
      </div>

      {/* MAIN LAYOUT */}

      <div className="attendance-main-grid">
        {/* CALENDAR */}

        <div
          className="attendance-calendar-card"
          style={{
            backgroundColor: "#fff",

            borderRadius: 16,

            padding: 24,

            border: "1px solid #e2e8f0",

            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",

            minWidth: 0,
          }}
        >
          <div
            className="calendar-header-container"
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

              marginBottom: 24,
            }}
          >
            <div className="calendar-header-nav">
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                aria-label="Previous Month"
                style={navButtonStyle}
              >
                <ChevronLeft size={18} />
              </button>

              <h2
                style={{
                  fontSize: 18,

                  fontWeight: 700,

                  color: "#0f172a",

                  margin: "0 8px",

                  textAlign: "center",

                  minWidth: 140,
                }}
              >
                {formattedMonthYear}
              </h2>

              <button
                onClick={handleNextMonth}
                title="Next Month"
                aria-label="Next Month"
                style={navButtonStyle}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",

              gridTemplateColumns: "repeat(7,minmax(0,1fr))",

              textAlign: "center",

              fontSize: 13,

              fontWeight: 500,

              color: "#64748b",

              marginBottom: 12,
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div
            className="calendar-grid-container"
            style={{
              display: "grid",

              gridTemplateColumns: "repeat(7,minmax(0,1fr))",

              gap: 8,
            }}
          >
            {calendarDays.map((item, index) => {
              const isOtherMonth = !item.isCurrentMonth;

              const isToday = item.status === "today";

              const tileStyles = getTileStyles(item);
              const festival = item.isCurrentMonth
                ? FESTIVAL_HOLIDAYS[item.dateKey]
                : null;

              return (
                <div
                  key={item.dateKey || `other-${index}`}
                  className="calendar-tile"
                  title={
                    item.record
                      ? `${item.dateKey}: ${buildTimeLabel(item.record)}`
                      : item.dateKey || ""
                  }
                  style={{
                    background: festival
                      ? `linear-gradient(145deg, ${festival.color}30, ${festival.color}12)`
                      : tileStyles.backgroundColor,
                    border: festival
                      ? `1.5px solid ${festival.color}`
                      : tileStyles.border,
                    boxShadow: festival
                      ? `0 3px 10px ${festival.color}20`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",

                      justifyContent: "center",

                      alignItems: "center",
                    }}
                  >
                    <span
                      className="day-number-text"
                      style={{
                        fontSize: 14,

                        fontWeight: isToday ? 700 : 500,

                        color: isOtherMonth
                          ? "#cbd5e1"
                          : isToday
                            ? "#0066FF"
                            : "#1e293b",

                        width: isToday ? 24 : "auto",

                        height: isToday ? 24 : "auto",

                        borderRadius: isToday ? "50%" : 0,

                        backgroundColor: isToday ? "#dbeafe" : "transparent",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",
                      }}
                    >
                      {item.day}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",

                      flexDirection: "column",

                      alignItems: "center",

                      gap: 4,
                    }}
                  >
                    {festival && (
                      <div
                        title={festival.name}
                        style={{
                          width: "100%",
                          textAlign: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: festival.color,
                          background: `${festival.color}18`,
                          borderRadius: 6,
                          padding: "4px 2px",
                          lineHeight: 1.3,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {festival.emoji} {festival.name}
                      </div>
                    )}

                    {item.status === "present" && (
                      <div
                        className="calendar-tile-status"
                        style={{ background: "#d1fae5", color: "#047857" }}
                      >
                        Present
                      </div>
                    )}

                    {item.status === "absent" && (
                      <div
                        className="calendar-tile-status"
                        style={{ background: "#fee2e2", color: "#b91c1c" }}
                      >
                        Leave
                      </div>
                    )}

                    {item.status === "today" && (
                      <div
                        className="calendar-tile-status"
                        style={{ background: "#dbeafe", color: "#1d4ed8" }}
                      >
                        Today
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* LEGEND */}

          <div className="attendance-legend-container">
            {[
              ["#10b981", "Present"],

              ["#ef4444", "Absent / Leave"],

              ["#0066FF", "Today"],
            ].map(([color, label]) => (
              <div
                key={label}
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 10,

                    height: 10,

                    borderRadius: "50%",

                    backgroundColor: color,

                    flexShrink: 0,
                  }}
                />

                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}

        <div
          style={{
            display: "flex",

            flexDirection: "column",

            gap: 24,

            minWidth: 0,
          }}
        >
          {/* SUMMARY */}

          <div
            className="attendance-summary-card"
            style={{
              background: "#fff",

              borderRadius: 16,

              padding: 20,

              border: "1px solid #e2e8f0",

              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                gap: 8,

                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 15,

                  fontWeight: 700,

                  color: "#0f172a",

                  margin: 0,
                }}
              >
                Attendance Summary
              </h3>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setIsRangeDropdownOpen((value) => !value)}
                  aria-expanded={isRangeDropdownOpen}
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: 4,

                    fontSize: 12,

                    color: "#64748b",

                    background: "#f8fafc",

                    border: "1px solid #e2e8f0",

                    borderRadius: 8,

                    padding: "7px 10px",

                    cursor: "pointer",

                    whiteSpace: "nowrap",
                  }}
                >
                  {summaryRange}

                  <ChevronDown size={14} />
                </button>

                {isRangeDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",

                      top: "calc(100% + 4px)",

                      right: 0,

                      background: "#fff",

                      border: "1px solid #e2e8f0",

                      borderRadius: 10,

                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",

                      width: 130,

                      zIndex: 50,

                      overflow: "hidden",
                    }}
                  >
                    {["This Month", "Last Month", "This Year"].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setSummaryRange(range);

                          setIsRangeDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",

                          padding: "9px 12px",

                          fontSize: 12,

                          textAlign: "left",

                          border: "none",

                          background:
                            summaryRange === range ? "#eff6ff" : "transparent",

                          color: summaryRange === range ? "#0066FF" : "#334155",

                          fontWeight: summaryRange === range ? 600 : 400,

                          cursor: "pointer",
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
              {summaryCards.map((card) => {
                const IconComponent = card.icon;

                return (
                  <div
                    key={card.title}
                    style={{
                      background: "#f8fafc",

                      borderRadius: 12,

                      padding: 14,

                      display: "flex",

                      gap: 12,

                      alignItems: "flex-start",

                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 36,

                        height: 36,

                        borderRadius: 10,

                        background: card.bgColor,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={20} color={card.iconColor} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11,

                          color: "#64748b",

                          marginBottom: 2,

                          fontWeight: 500,
                        }}
                      >
                        {card.title}
                      </div>

                      <div
                        style={{
                          fontSize: 20,

                          fontWeight: 700,

                          color: "#0f172a",

                          lineHeight: 1.2,
                        }}
                      >
                        {card.value}
                      </div>

                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {card.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECENT LOGS */}

          <div
            style={{
              background: "#fff",

              borderRadius: 16,

              padding: 20,

              border: "1px solid #e2e8f0",

              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",

              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 15,

                  fontWeight: 700,

                  color: "#0f172a",

                  margin: 0,
                }}
              >
                Recent Logs
              </h3>

              <button
                onClick={() => setShowAllLogsModal(true)}
                style={{
                  fontSize: 12,

                  color: "#0066FF",

                  fontWeight: 600,

                  background: "transparent",

                  border: "none",

                  cursor: "pointer",
                }}
              >
                View All
              </button>
            </div>

            <div
              style={{
                display: "flex",

                flexDirection: "column",

                gap: 12,
              }}
            >
              {recentLogs.length === 0 ? (
                <div
                  style={{
                    padding: "12px 0",

                    color: "#94a3b8",

                    fontSize: 12,
                  }}
                >
                  No attendance records yet.
                </div>
              ) : (
                recentLogs.map((log, index) => (
                  <div
                    key={log.dateKey}
                    className="attendance-log-row"
                    style={{
                      display: "flex",

                      alignItems: "center",

                      justifyContent: "space-between",

                      gap: 10,

                      padding: "10px 0",

                      borderBottom:
                        index !== recentLogs.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",

                        alignItems: "center",

                        gap: 12,

                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 8,

                          height: 8,

                          borderRadius: "50%",

                          background:
                            log.type === "absent" ? "#ef4444" : "#10b981",

                          flexShrink: 0,
                        }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,

                            fontWeight: 600,

                            color: "#0f172a",
                          }}
                        >
                          {log.date}
                        </div>

                        <div
                          style={{
                            fontSize: 11,

                            color: "#94a3b8",
                          }}
                        >
                          {log.day}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "right",

                        minWidth: 0,

                        overflowWrap: "anywhere",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,

                          fontWeight: 500,

                          color: log.type === "absent" ? "#ef4444" : "#334155",
                        }}
                      >
                        {log.type === "absent"
                          ? `Leave (${log.time})`
                          : log.time}
                      </div>

                      <div
                        style={{
                          fontSize: 11,

                          color: "#94a3b8",
                        }}
                      >
                        {log.duration}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ALL LOGS MODAL */}

      {showAllLogsModal && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowAllLogsModal(false);
            }
          }}
          style={{
            position: "fixed",

            inset: 0,

            background: "rgba(15,23,42,0.5)",

            backdropFilter: "blur(4px)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            zIndex: 1000,

            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",

              borderRadius: 16,

              width: 500,

              maxWidth: "90vw",

              maxHeight: "80vh",

              display: "flex",

              flexDirection: "column",

              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",

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
                <h3
                  style={{
                    fontSize: 18,

                    fontWeight: 700,

                    color: "#0f172a",

                    margin: 0,
                  }}
                >
                  All Attendance Logs
                </h3>

                <p
                  style={{
                    fontSize: 12,

                    color: "#64748b",

                    margin: "2px 0 0",
                  }}
                >
                  Complete attendance records, newest first
                </p>
              </div>

              <button
                onClick={() => setShowAllLogsModal(false)}
                aria-label="Close attendance logs"
                style={{
                  background: "#f1f5f9",

                  border: "none",

                  borderRadius: 8,

                  padding: 6,

                  cursor: "pointer",

                  color: "#64748b",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: "20px 24px",

                overflowY: "auto",

                flex: 1,
              }}
            >
              {allLogs.length === 0 ? (
                <div
                  style={{
                    color: "#94a3b8",

                    fontSize: 13,
                  }}
                >
                  No attendance logs available.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",

                    flexDirection: "column",

                    gap: 12,
                  }}
                >
                  {allLogs.map((log) => (
                    <div
                      key={log.dateKey}
                      style={{
                        display: "flex",

                        alignItems: "center",

                        justifyContent: "space-between",

                        gap: 12,

                        padding: "12px 16px",

                        background: "#f8fafc",

                        borderRadius: 10,

                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: 12,

                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            width: 10,

                            height: 10,

                            borderRadius: "50%",

                            background:
                              log.type === "absent" ? "#ef4444" : "#10b981",

                            flexShrink: 0,
                          }}
                        />

                        <div>
                          <div
                            style={{
                              fontSize: 14,

                              fontWeight: 600,

                              color: "#0f172a",
                            }}
                          >
                            {log.date}
                          </div>

                          <div
                            style={{
                              fontSize: 12,

                              color: "#64748b",
                            }}
                          >
                            {log.day}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign: "right",

                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,

                            fontWeight: 600,

                            color:
                              log.type === "absent" ? "#ef4444" : "#334155",
                          }}
                        >
                          {log.type === "absent"
                            ? `Leave (${log.time})`
                            : log.time}
                        </div>

                        <div
                          style={{
                            fontSize: 12,

                            color: "#94a3b8",
                          }}
                        >
                          {log.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const navButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#475569",
};
