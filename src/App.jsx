import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  FileText,
  LogOut,
  Bell,
  User,
  CheckSquare,
  Menu,
  X,
} from "lucide-react";

import logoImg from "./assets/WorkX_Concepts-07.png";
import signinLogoImg from "./assets/Work X_Concepts-07.png";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import ProfilePage from "./pages/ProfilePage";
import LeavePage from "./pages/LeavePage";
import AttendancePage from "./pages/AttendancePage";

function WorkXLogo({ logoUrl = logoImg }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {!imageError && logoUrl ? (
        <img
          src={logoUrl}
          alt="Company Logo"
          onError={() => setImageError(true)}
          style={{
            height: "45px",
            width: "auto",
            maxHeight: "45px",
            objectFit: "contain",
          }}
        />
      ) : (
        <div
          style={{
            backgroundColor: "#0066FF",
            borderRadius: "8px",
            padding: "6px 8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#fff", fontWeight: "900", fontSize: "16px" }}>
            X
          </span>
        </div>
      )}
    </div>
  );
}

const sidebarSections = [
  {
    title: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "profile", label: "My Profile", icon: User },
      { id: "tasks", label: "My Tasks", icon: CheckSquare },
      { id: "attendance", label: "Attendance", icon: CalendarCheck },
      { id: "leave", label: "Leave", icon: CalendarDays },
      { id: "payslips", label: "Payslip", icon: FileText },
    ],
  },
];

const initialProfileState = {
  name: "",
  role: "",
  email: "",
  phone: "",
  department: "",
  location: "",
  joinedDate: "",
  presentAddress: "",
  city: "",
  state: "",
  avatar: "",
};

const LEAVE_STORAGE_KEY = "workx_leave_history_v4";

const DEFAULT_LEAVE_HISTORY = [
  {
    id: 1,
    type: "Earned Leave",
    from: "07 Oct 2026",
    to: "07 Oct 2026",
    days: 1,
    reason: "Personal Work",
    status: "Pending",
  },
  {
    id: 2,
    type: "Casual Leave",
    from: "12 Oct 2026",
    to: "14 Oct 2026",
    days: 3,
    reason: "Family Function",
    status: "Pending",
  },
  {
    id: 3,
    type: "Sick Leave",
    from: "02 Sep 2026",
    to: "02 Sep 2026",
    days: 1,
    reason: "Viral Fever",
    status: "Pending",
  },
];

// UPDATED TO TOTAL 12 DAYS (4 + 3 + 5)
const LEAVE_TOTALS = {
  "Casual Leave": 4,
  "Sick Leave": 3,
  "Earned Leave": 5,
};

const INITIAL_USED_BALANCE = {
  "Casual Leave": 0,
  "Sick Leave": 0,
  "Earned Leave": 0,
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [userProfile, setUserProfile] = useState(initialProfileState);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Shared Leave History State
  const [leaveHistory, setLeaveHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LEAVE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LEAVE_HISTORY;
    } catch {
      return DEFAULT_LEAVE_HISTORY;
    }
  });

  useEffect(() => {
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(leaveHistory));
  }, [leaveHistory]);

  // Dynamic Leave Calculation Logic
  const getUsedLeave = (leaveType) => {
    const initialUsed = INITIAL_USED_BALANCE[leaveType] || 0;
    const currentApproved = leaveHistory
      .filter((l) => l.type === leaveType && l.status === "Approved")
      .reduce((sum, l) => sum + Number(l.days || 0), 0);

    return Math.max(initialUsed + currentApproved, 0);
  };

  const casualUsed = getUsedLeave("Casual Leave");
  const casualTotal = LEAVE_TOTALS["Casual Leave"];
  const casualRemaining = Math.max(casualTotal - casualUsed, 0);

  const sickUsed = getUsedLeave("Sick Leave");
  const sickTotal = LEAVE_TOTALS["Sick Leave"];
  const sickRemaining = Math.max(sickTotal - sickUsed, 0);

  const earnedUsed = getUsedLeave("Earned Leave");
  const earnedTotal = LEAVE_TOTALS["Earned Leave"];
  const earnedRemaining = Math.max(earnedTotal - earnedUsed, 0);

  const totalCapacity = casualTotal + sickTotal + earnedTotal; // TOTAL: 12
  const totalUsed = casualUsed + sickUsed + earnedUsed;
  const totalRemaining = casualRemaining + sickRemaining + earnedRemaining;

  const leaveSummary = {
    casual: { remaining: casualRemaining, total: casualTotal, used: casualUsed },
    sick: { remaining: sickRemaining, total: sickTotal, used: sickUsed },
    earned: { remaining: earnedRemaining, total: earnedTotal, used: earnedUsed },
    overall: { remaining: totalRemaining, total: totalCapacity, used: totalUsed },
  };

  // Shared Tasks State
  const [tasks, setTasks] = useState([
    {
      id: 1,
      text: "Complete UI Review for HR Module",
      date: "Today",
      tagBg: "#fef2f2",
      tagColor: "#ef4444",
      done: false,
    },
    {
      id: 2,
      text: "Update Project Documentation",
      date: "Today",
      tagBg: "#eff6ff",
      tagColor: "#2563eb",
      done: true,
    },
    {
      id: 3,
      text: "Attend Design Sync Meeting",
      date: "Tomorrow",
      tagBg: "#fef3c7",
      tagColor: "#d97706",
      done: false,
    },
    {
      id: 4,
      text: "Share Assets with Dev Team",
      date: "3 Oct",
      tagBg: "#f1f5f9",
      tagColor: "#64748b",
      done: false,
    },
    {
      id: 5,
      text: "Submit Timesheet",
      date: "Completed",
      tagBg: "#dcfce7",
      tagColor: "#166534",
      done: true,
    },
  ]);

  const handleAddTask = (text, dateValue = new Date().toISOString().split("T")[0]) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toISOString().split("T")[0];

    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split("T")[0];

    let displayLabel = dateValue;
    let tagBg = "#f1f5f9";
    let tagColor = "#64748b";

    if (dateValue === todayStr) {
      displayLabel = "Today";
      tagBg = "#fef2f2";
      tagColor = "#ef4444";
    } else if (dateValue === yesterdayStr) {
      displayLabel = "Yesterday";
      tagBg = "#f3e8ff";
      tagColor = "#7e22ce";
    } else if (dateValue === tomorrowStr) {
      displayLabel = "Tomorrow";
      tagBg = "#fef3c7";
      tagColor = "#d97706";
    } else if (dateValue < todayStr) {
      const d = new Date(dateValue);
      displayLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      tagBg = "#f3e8ff";
      tagColor = "#7e22ce";
    } else {
      const d = new Date(dateValue);
      displayLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      tagBg = "#eff6ff";
      tagColor = "#2563eb";
    }

    const newTask = {
      id: Date.now(),
      text,
      date: displayLabel,
      tagBg,
      tagColor,
      done: false,
    };
    setTasks([newTask, ...tasks]);
  };

  const handleToggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleLogout = () => setIsAuthenticated(false);

  const navigate = (page) => {
    setActivePage(page);
    setIsMobileOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <img
              src={signinLogoImg}
              alt="Sign In Logo"
              style={{ height: "48px", width: "auto", objectFit: "contain" }}
            />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your WorkX HR Portal</p>
          <button
            onClick={() => setIsAuthenticated(true)}
            className="primary-button"
            style={{ width: "100%", padding: "12px", height: "auto" }}
          >
            Sign In to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {isMobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${isMobileOpen ? "sidebar-open" : ""}`}>
        <div>
          <div style={{ padding: "0 8px 32px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <WorkXLogo />
            <button
              className="mobile-close-btn"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={20} color="#fff" />
            </button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {sidebarSections[0].items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} color={isActive ? "#ffffff" : "#94a3b8"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} color="#ef4444" />
            <span style={{ color: "#ef4444" }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Toggle Navigation"
            >
              <Menu size={22} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={25} color="#64748b" />
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-1px",
                  width: "7px",
                  height: "7px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                }}
              />
            </div>

            <div
              onClick={() => navigate("profile")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#cbd5e1",
                  backgroundImage: userProfile?.avatar
                    ? `url(${userProfile.avatar})`
                    : "url('https://i.pinimg.com/236x/08/35/0c/08350cafa4fabb8a6a1be2d9f18f2d88.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="admin-info">
                <strong>{userProfile.name || "User Name"}</strong>
                <span>{userProfile.role || "Role"}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "dashboard" && (
            <DashboardPage
              userProfile={userProfile}
              navigate={navigate}
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              leaveSummary={leaveSummary}
            />
          )}
          {activePage === "tasks" && (
            <TasksPage
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
          {activePage === "profile" && (
            <ProfilePage
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              savedMsg={profileSavedMsg}
              setProfileSavedMsg={setProfileSavedMsg}
            />
          )}
          {activePage === "attendance" && <AttendancePage />}
          {activePage === "leave" && (
            <LeavePage
              leaveHistory={leaveHistory}
              setLeaveHistory={setLeaveHistory}
              leaveSummary={leaveSummary}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export const whiteCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
};