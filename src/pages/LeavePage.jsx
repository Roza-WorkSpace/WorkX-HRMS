import { useEffect, useMemo, useState } from "react";
import { whiteCardStyle } from "../App";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  X,
} from "lucide-react";

const LEAVE_STORAGE_KEY = "workx_leave_history_v4";
const LEAVE_UPDATED_EVENT = "leaveHistoryUpdated";

const LEAVE_TYPES = [
  { type: "Emergency Leave", key: "emergency", total: 6, color: "#f97316", bg: "#fff7ed" },
  { type: "Planned Leave", key: "planned", total: 12, color: "#0066FF", bg: "#eff6ff" },
  { type: "Paid Leave", key: "paid", total: 12, color: "#10b981", bg: "#ecfdf5" },
  { type: "Birthday Leave", key: "birthday", total: 1, color: "#8b5cf6", bg: "#f5f3ff" },
];

const addMonths = (date, months) => {
  const result = new Date(date);
  const day = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() < day) result.setDate(0);
  return result;
};

const getRequestDays = (type, from, to) => {
  if (type === "Birthday Leave") return 1;

  const start = toDateOnly(from);
  const end = toDateOnly(to);
  if (!start || !end || end < start) return 0;

  // Sandwich rule: if the requested leave includes a Monday or Friday,
  // the adjoining weekend is included in the deduction.
  let hasMondayOrFriday = false;
  const scan = new Date(start);
  while (scan <= end) {
    const day = scan.getDay();
    if (day === 1 || day === 5) {
      hasMondayOrFriday = true;
      break;
    }
    scan.setDate(scan.getDate() + 1);
  }

  if (!hasMondayOrFriday) return countWorkingDays(from, to);

  const adjustedStart = new Date(start);
  const adjustedEnd = new Date(end);

  // A Monday-only request includes the preceding Saturday and Sunday.
  if (adjustedStart.getDay() === 1) adjustedStart.setDate(adjustedStart.getDate() - 2);
  // A Friday-only request includes the following Saturday and Sunday.
  if (adjustedEnd.getDay() === 5) adjustedEnd.setDate(adjustedEnd.getDate() + 2);

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((adjustedEnd - adjustedStart) / millisecondsPerDay) + 1;
};

const readLeaveStorage = () => {
  try {
    const saved = localStorage.getItem(LEAVE_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to read leave history:", error);
    return [];
  }
};

const toDateOnly = (value) => {
  if (!value) return null;

  // HTML date inputs already return YYYY-MM-DD. Parse them locally to avoid
  // timezone shifts caused by new Date("YYYY-MM-DD").
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const formatDate = (value) => {
  const date = toDateOnly(value);
  if (!date) return value || "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const countWorkingDays = (from, to) => {
  const start = toDateOnly(from);
  const end = toDateOnly(to);
  if (!start || !end || end < start) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count += 1;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

const getStatusBadge = (status) => {
  const commonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  };

  if (status === "Approved") {
    return (
      <span style={{ ...commonStyle, backgroundColor: "#ecfdf5", color: "#059669" }}>
        <CheckCircle2 size={14} /> Approved
      </span>
    );
  }

  if (status === "Pending") {
    return (
      <span style={{ ...commonStyle, backgroundColor: "#fffbeb", color: "#d97706" }}>
        <Clock size={14} /> Pending
      </span>
    );
  }

  if (status === "Rejected") {
    return (
      <span style={{ ...commonStyle, backgroundColor: "#fef2f2", color: "#dc2626" }}>
        <XCircle size={14} /> Rejected
      </span>
    );
  }

  return null;
};

export default function LeavePage({
  leaveHistory = [],
  setLeaveHistory,
  leaveSummary = {},
  employeeJoiningDate = "",
  employeeBirthday = "",
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState("Emergency Leave");
  const [formFrom, setFormFrom] = useState("");
  const [formTo, setFormTo] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const safeHistory = Array.isArray(leaveHistory) ? leaveHistory : [];

  // Restore older saved requests if the parent initially supplies an empty list.
  useEffect(() => {
    if (typeof setLeaveHistory !== "function") return;
    if (safeHistory.length > 0) return;

    const saved = readLeaveStorage();
    if (saved.length > 0) setLeaveHistory(saved);
    // Run only on mount: parent state is the source of truth after initialization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist every add, delete, or status change and notify AttendancePage.
  useEffect(() => {
    try {
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(safeHistory));
      window.dispatchEvent(new Event(LEAVE_UPDATED_EVENT));
    } catch (error) {
      console.error("Unable to save leave history:", error);
    }
  }, [safeHistory]);

  const calculatedDays = useMemo(
    () => getRequestDays(formType, formFrom, formTo),
    [formType, formFrom, formTo]
  );

  const currentYear = new Date().getFullYear();
  const joiningDate = toDateOnly(employeeJoiningDate);
  const probationCompleted = joiningDate
    ? new Date() >= addMonths(joiningDate, 3)
    : null;

  const leaveBalances = useMemo(() => {
    return LEAVE_TYPES.map((leaveType) => {
      const approvedDays = safeHistory
        .filter((item) => {
          const leaveStart = toDateOnly(item.from);
          return (
            item.type === leaveType.type &&
            item.status === "Approved" &&
            leaveStart &&
            leaveStart.getFullYear() === currentYear
          );
        })
        .reduce((total, item) => {
          // Prefer the saved deduction so sandwich weekends remain included.
          const days = Number(item.days) || getRequestDays(item.type, item.from, item.to);
          return total + days;
        }, 0);

      const supplied = leaveSummary?.[leaveType.key];
      const total = Number(supplied?.total ?? leaveType.total);
      const used = approvedDays;
      const remaining = Math.max(0, total - used);

      return {
        ...leaveType,
        total,
        used,
        remaining,
      };
    });
  }, [safeHistory, leaveSummary]);

  const updateHistory = (updater) => {
    if (typeof setLeaveHistory !== "function") {
      setNotice("Leave history cannot be updated because its state setter is missing.");
      return;
    }
    setLeaveHistory((previous) => {
      const current = Array.isArray(previous) ? previous : safeHistory;
      return updater(current);
    });
  };

  const handleApplyLeave = (event) => {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (!formFrom || !formTo || !formReason.trim()) {
      setFormError("Please complete all fields.");
      return;
    }

    const start = toDateOnly(formFrom);
    const end = toDateOnly(formTo);

    if (!start || !end || end < start) {
      setFormError("Please select a valid date range. The end date cannot be before the start date.");
      return;
    }

    if (start < toDateOnly(toDateKey(new Date()))) {
      setFormError("Leave cannot be applied for a past date.");
      return;
    }

    if (start.getFullYear() !== end.getFullYear()) {
      setFormError("Please submit separate leave requests for dates in different calendar years.");
      return;
    }

    if (formType === "Paid Leave" && probationCompleted === false) {
      setFormError("Paid Leave becomes available only after completing 3 months of probation.");
      return;
    }
    if (formType === "Paid Leave" && probationCompleted === null) {
      setFormError("Add the employee joining date to verify 3-month probation eligibility.");
      return;
    }

    if (formType === "Birthday Leave") {
      if (!employeeBirthday) {
        setFormError("Add the employee birthday in the employee profile before applying for Birthday Leave.");
        return;
      }
      const birthday = toDateOnly(employeeBirthday);
      const selected = toDateOnly(formFrom);
      if (!birthday || !selected ||
          birthday.getMonth() !== selected.getMonth() ||
          birthday.getDate() !== selected.getDate() ||
          formFrom !== formTo) {
        setFormError("Birthday Leave can be requested for one day only, on the employee's birthday.");
        return;
      }
    }

    const days = calculatedDays;
    if (days < 1) {
      setFormError("The selected date range contains no working days.");
      return;
    }

    const overlapping = safeHistory.some((item) => {
      if (!["Pending", "Approved"].includes(item.status)) return false;
      const existingStart = toDateOnly(item.from);
      const existingEnd = toDateOnly(item.to);
      if (!existingStart || !existingEnd) return false;
      return start <= existingEnd && end >= existingStart;
    });

    if (overlapping) {
      setFormError("You already have a pending or approved leave request overlapping these dates.");
      return;
    }

    const selectedBalance = leaveBalances.find((item) => item.type === formType);
    if (selectedBalance && days > selectedBalance.remaining) {
      setFormError(
        `Insufficient ${formType} balance. You have ${selectedBalance.remaining} day(s) remaining.`
      );
      return;
    }

    const newLeave = {
      id: `leave_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: formType,
      from: formFrom,
      to: formTo,
      days,
      reason: formReason.trim(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    updateHistory((previous) => [newLeave, ...previous]);
    setIsModalOpen(false);
    setFormType("Emergency Leave");
    setFormFrom("");
    setFormTo("");
    setFormReason("");
    setFormError("");
    setNotice("Your leave request has been submitted successfully.");
  };

  const handleDeleteLeave = (id) => {
    updateHistory((previous) => previous.filter((item) => item.id !== id));
    setNotice("Leave request deleted.");
  };

  const handleStatusChange = (id, newStatus) => {
    updateHistory((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
      )
    );
    setNotice(`Leave request ${newStatus.toLowerCase()}.`);
  };

  const openApplyModal = () => {
    setFormError("");
    setNotice("");
    setIsModalOpen(true);
  };

  const closeApplyModal = () => {
    setIsModalOpen(false);
    setFormError("");
  };

  const todayKey = toDateKey(new Date());

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        position: "relative",
        minWidth: 0,
      }}
    >
      <style>{`
  .leave-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    text-align: left !important;
  }
  .leave-header * {
    text-align: left !important;
  }
  .leave-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .leave-table {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;
    text-align: left;
    font-size: 13.5px;
  }
  .leave-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .leave-input {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    outline: none;
    font-size: 13.5px;
    background: #fff;
    color: #0f172a;
  }
  .leave-input:focus {
    border-color: #0066ff;
    box-shadow: 0 0 0 3px rgba(0,102,255,.10);
  }
  .leave-action {
    border: 0;
    border-radius: 6px;
    padding: 6px 9px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .leave-policy-panel {
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid #dbe6f3;
    border-radius: 16px;
    padding: 20px 22px;
    box-shadow: 0 5px 18px rgba(15, 23, 42, 0.035);
  }
  .leave-policy-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }
  .leave-policy-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #075fe5;
    background: #eaf2ff;
    flex: 0 0 auto;
  }
  .leave-policy-heading h3 { margin: 0; color: #0f172a; font-size: 15px; font-weight: 750; }
  .leave-policy-heading p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
  .leave-policy-reset {
    margin-left: auto;
    border: 1px solid #dbeafe;
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 999px;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }
  .leave-policy-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }
  .leave-policy-item {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
    padding: 12px;
    border: 1px solid #e7edf5;
    border-radius: 12px;
    background: #fff;
  }
  .leave-policy-number {
    width: 39px;
    height: 39px;
    flex: 0 0 39px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.5px;
  }
  .leave-policy-item strong { display: block; color: #1e293b; font-size: 12px; line-height: 1.35; }
  .leave-policy-item small { display: block; margin-top: 3px; color: #64748b; font-size: 10.5px; line-height: 1.45; }
  .leave-policy-item.emergency .leave-policy-number { color: #ea580c; background: #fff1e8; }
  .leave-policy-item.planned .leave-policy-number { color: #2563eb; background: #eff6ff; }
  .leave-policy-item.paid .leave-policy-number { color: #059669; background: #ecfdf5; }
  .leave-policy-item.birthday .leave-policy-number { color: #7c3aed; background: #f5f3ff; }

  /* Upgraded Sandwich Note Styles */
  .leave-sandwich-note {
    position: relative;
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: flex-start;
    gap: 16px;
    margin-top: 18px;
    padding: 20px 22px;
    overflow: hidden;
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: 16px;
    background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 60%, #fffaf0 100%);
    box-shadow: 0 4px 16px rgba(217, 119, 6, 0.06);
    transition: all 0.2s ease;
  }
  .leave-sandwich-note:hover {
    box-shadow: 0 6px 20px rgba(217, 119, 6, 0.1);
    border-color: rgba(245, 158, 11, 0.4);
  }
  .leave-sandwich-note::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 5px;
    background: linear-gradient(180deg, #f59e0b, #ea580c);
  }
  .leave-sandwich-icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 12px;
    color: #ea580c;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(234, 88, 12, 0.08);
    flex: 0 0 auto;
  }
  .leave-sandwich-copy { 
    min-width: 0; 
  }
  .leave-sandwich-title-row { 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    flex-wrap: wrap; 
    margin-bottom: 4px;
  }
  .leave-sandwich-note strong { 
    color: #7c2d12; 
    font-size: 14px; 
    font-weight: 750; 
    letter-spacing: -0.2px; 
  }
  .leave-sandwich-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border: 1px solid rgba(249, 115, 22, 0.25);
    border-radius: 999px;
    color: #c2410c;
    background: rgba(255, 255, 255, 0.85);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .leave-sandwich-note p { 
    margin: 4px 0 0; 
    color: #78350f; 
    font-size: 13px; 
    line-height: 1.6; 
  }
  .leave-sandwich-note p + p { 
    margin-top: 6px; 
    color: #9a3412; 
  }
  .leave-sandwich-note b { 
    color: #9a3412; 
    font-weight: 800; 
    background: rgba(251, 191, 36, 0.15);
    padding: 0 4px;
    border-radius: 4px;
  }

  /* Media Queries */
  @media (max-width: 900px) {
    .leave-policy-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 600px) {
    .leave-policy-panel { padding: 16px; }
    .leave-policy-heading { align-items: flex-start; flex-wrap: wrap; }
    .leave-policy-reset { margin-left: 54px; }
    .leave-policy-grid { grid-template-columns: 1fr; }
    .leave-header {
      align-items: flex-start !important;
      flex-direction: column !important;
    }
    .leave-header button {
      width: 100%;
      justify-content: center;
    }
    .leave-form-grid {
      grid-template-columns: 1fr !important;
    }
    .leave-modal-panel {
      padding: 18px !important;
      max-height: 92vh;
      overflow-y: auto;
    }
    .leave-sandwich-note { 
      grid-template-columns: 40px minmax(0, 1fr); 
      gap: 12px; 
      padding: 16px; 
    }
    .leave-sandwich-icon { 
      width: 40px; 
      height: 40px; 
      border-radius: 10px; 
    }
    .leave-sandwich-tag { 
      grid-column: 2; 
      justify-self: start; 
    }
    .leave-sandwich-note p { 
      font-size: 12px; 
    }
  }
`}</style>

      {/* HEADER */}
      <div
        className="leave-header"
        style={{
          ...whiteCardStyle,
          backgroundColor: "rgb(8, 14, 30)",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "left",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <h2 style={{ color: "#ffffff", margin: 0, textAlign: "left" }}>Leave Management</h2>
          <p style={{ color: "#cbd5e1", margin: "8px 0 0 0", fontSize: "13.5px", textAlign: "left" }}>
            Annual leave balances reset every year. Unused leave is not carried forward.
          </p>
        </div>

        <button
          onClick={openApplyModal}
          style={{
            backgroundColor: "#0066FF",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "13.5px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,102,255,0.2)",
            flexShrink: 0,
          }}
        >
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {notice && (
        <div
          role="status"
          style={{
            padding: "10px 14px",
            borderRadius: "9px",
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            fontSize: "13px",
            textAlign: "left",
          }}
        >
          {notice}
        </div>
      )}

      <section className="leave-policy-panel" aria-label="Leave policy overview" style={{ textAlign: "left" }}>
        <div className="leave-policy-heading">
          <div className="leave-policy-icon"><Calendar size={19} /></div>
          <div style={{ textAlign: "left" }}>
            <h3 style={{ textAlign: "left" }}>Leave policy overview</h3>
            <p style={{ textAlign: "left" }}>Annual entitlements and important rules</p>
          </div>
          <span className="leave-policy-reset">Annual reset · No carry-forward</span>
        </div>

        <div className="leave-policy-grid">
          <div className="leave-policy-item emergency">
            <span className="leave-policy-number">06</span>
            <div style={{ textAlign: "left" }}><strong style={{ textAlign: "left" }}>Emergency leave</strong><small style={{ textAlign: "left" }}>days per year · inform 2 hours in advance</small></div>
          </div>
          <div className="leave-policy-item planned">
            <span className="leave-policy-number">12</span>
            <div style={{ textAlign: "left" }}><strong style={{ textAlign: "left" }}>Planned leave</strong><small style={{ textAlign: "left" }}>days per year</small></div>
          </div>
          <div className="leave-policy-item paid">
            <span className="leave-policy-number">12</span>
            <div style={{ textAlign: "left" }}><strong style={{ textAlign: "left" }}>Paid leave</strong><small style={{ textAlign: "left" }}>days per year · after 3-month probation</small></div>
          </div>
          <div className="leave-policy-item birthday">
            <span className="leave-policy-number">01</span>
            <div style={{ textAlign: "left" }}><strong style={{ textAlign: "left" }}>Birthday leave</strong><small style={{ textAlign: "left" }}>day on the employee's birthday</small></div>
          </div>
        </div>

        <div className="leave-sandwich-note">
          <div className="leave-sandwich-icon"><Calendar size={19} /></div>
          <div className="leave-sandwich-copy" style={{ textAlign: "left" }}>
            <div className="leave-sandwich-title-row">
              <strong style={{ textAlign: "left" }}>Sandwich Leave Rule</strong>
              <span className="leave-sandwich-tag">Weekend deduction applies</span>
            </div>
            <p style={{ textAlign: "left" }}>Taking leave on Friday or Monday includes the adjoining Saturday and Sunday. A single Friday or Monday leave is counted as <b>3 days</b>.</p>
            <p style={{ textAlign: "left" }}>Taking leave on the 1st or 3rd Saturday will result in a deduction of <b>2 days</b> from the leave balance.</p>
          </div>
        </div>
      </section>

      {/* DYNAMIC LEAVE BALANCE CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          textAlign: "left",
        }}
      >
        {leaveBalances.map((info) => (
          <div
            key={info.type}
            style={{
              ...whiteCardStyle,
              borderLeft: `4px solid ${info.color}`,
              minWidth: 0,
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", textAlign: "left" }}>
                {info.type}
              </span>
              <div
                style={{
                  backgroundColor: info.bg,
                  color: info.color,
                  padding: "6px",
                  borderRadius: "8px",
                }}
              >
                <Calendar size={18} />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "8px",
                textAlign: "left",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", textAlign: "left" }}>
                  {info.used} / {info.total}
                </span>
                <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px", textAlign: "left" }}>
                  days used
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", textAlign: "left" }}>
                Left: <strong style={{ color: "#334155" }}>{info.remaining}</strong>
              </div>
            </div>

            <div
              style={{
                height: "6px",
                backgroundColor: "#f1f5f9",
                borderRadius: "10px",
                overflow: "hidden",
                marginTop: "12px",
              }}
            >
              <div
                style={{
                  width: `${info.total > 0 ? Math.min(100, (info.used / info.total) * 100) : 0}%`,
                  height: "100%",
                  backgroundColor: info.color,
                  borderRadius: "10px",
                  transition: "width .25s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* LEAVE HISTORY */}
      <div style={{ ...whiteCardStyle, minWidth: 0, textAlign: "left" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a", textAlign: "left" }}>
          Leave History
        </h3>

        <div className="leave-table-wrap">
          <table className="leave-table">
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                {["Leave Type", "From", "To", "Days", "Reason", "Status", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "12px 16px",
                        fontWeight: "600",
                        textAlign: heading === "Actions" ? "right" : "left",
                      }}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {safeHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "32px 24px",
                      color: "#64748b",
                    }}
                  >
                    No leave history found. Select Apply Leave to submit a request.
                  </td>
                </tr>
              ) : (
                [...safeHistory]
                  .sort((a, b) =>
                    String(b.createdAt || b.id).localeCompare(String(a.createdAt || a.id))
                  )
                  .map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px", fontWeight: "600", color: "#1e293b", textAlign: "left" }}>
                        {item.type}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569", textAlign: "left" }}>
                        {formatDate(item.from)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569", textAlign: "left" }}>
                        {formatDate(item.to)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569", textAlign: "left" }}>
                        {Number(item.days) || getRequestDays(item.type, item.from, item.to)} day(s)
                      </td>
                      <td
                        title={item.reason}
                        style={{
                          padding: "14px 16px",
                          color: "#475569",
                          maxWidth: "190px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      >
                        {item.reason}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "left" }}>
                        {getStatusBadge(item.status)}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          {item.status === "Pending" && (
                            <>
                              <button
                                className="leave-action"
                                onClick={() => handleStatusChange(item.id, "Approved")}
                                style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
                              >
                                Approve
                              </button>
                              <button
                                className="leave-action"
                                onClick={() => handleStatusChange(item.id, "Rejected")}
                                style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                              >
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteLeave(item.id)}
                            title="Delete leave request"
                            aria-label={`Delete ${item.type} request`}
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {isModalOpen && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeApplyModal();
          }}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="leave-modal-panel"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              width: "400px",
              maxWidth: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              boxSizing: "border-box",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                textAlign: "left",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", textAlign: "left" }}>
                Apply for Leave
              </h3>
              <button
                onClick={closeApplyModal}
                aria-label="Close leave form"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleApplyLeave}
              style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}
            >
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "6px",
                    textAlign: "left",
                  }}
                >
                  Leave Type
                </label>
                <select
                  value={formType}
                  onChange={(event) => setFormType(event.target.value)}
                  className="leave-input"
                >
                  {LEAVE_TYPES.map((item) => (
                    <option key={item.type} value={item.type}>
                      {item.type}
                    </option>
                  ))}
                </select>
              </div>

              {formType === "Emergency Leave" && (
                <div style={{ background: "#fff7ed", color: "#9a3412", padding: "10px 12px", borderRadius: 8, fontSize: 12, textAlign: "left" }}>
                  Emergency Leave allowance: 6 days per year. Employee must inform the manager at least 2 hours before the leave.
                </div>
              )}
              {formType === "Planned Leave" && (
                <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "10px 12px", borderRadius: 8, fontSize: 12, textAlign: "left" }}>
                  Planned Leave allowance: 12 days per year.
                </div>
              )}
              {formType === "Paid Leave" && (
                <div style={{ background: "#ecfdf5", color: "#047857", padding: "10px 12px", borderRadius: 8, fontSize: 12, textAlign: "left" }}>
                  Paid Leave allowance: 12 days per year, available after 3 months of probation.
                </div>
              )}
              {formType === "Birthday Leave" && (
                <div style={{ background: "#f5f3ff", color: "#6d28d9", padding: "10px 12px", borderRadius: 8, fontSize: 12, textAlign: "left" }}>
                  Birthday Leave: one day on the employee's birthday. Employee birthday must be configured in the profile.
                </div>
              )}

              <div className="leave-form-grid" style={{ textAlign: "left" }}>
                <div style={{ textAlign: "left" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
                      textAlign: "left",
                    }}
                  >
                    From Date
                  </label>
                  <input
                    className="leave-input"
                    type="date"
                    value={formFrom}
                    min={todayKey}
                    onChange={(event) => {
                      setFormFrom(event.target.value);
                      if (formTo && event.target.value > formTo) setFormTo("");
                      setFormError("");
                    }}
                    required
                  />
                </div>

                <div style={{ textAlign: "left" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
                      textAlign: "left",
                    }}
                  >
                    To Date
                  </label>
                  <input
                    className="leave-input"
                    type="date"
                    value={formTo}
                    min={formFrom || todayKey}
                    onChange={(event) => {
                      setFormTo(event.target.value);
                      setFormError("");
                    }}
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  textAlign: "left",
                }}
              >
                Calculated deduction: <strong>{calculatedDays} day(s)</strong>
                <div style={{ color: "#64748b", marginTop: "3px", textAlign: "left" }}>
                  If your leave includes a Friday or Monday, the adjoining weekend is included under the sandwich rule. Company holidays are not yet connected.
                </div>
              </div>

              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "6px",
                    textAlign: "left",
                  }}
                >
                  Reason
                </label>
                <textarea
                  className="leave-input"
                  placeholder="Enter reason for leave..."
                  value={formReason}
                  onChange={(event) => setFormReason(event.target.value)}
                  required
                  rows={3}
                  style={{ resize: "vertical", textAlign: "left" }}
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: "#fef2f2",
                    color: "#b91c1c",
                    padding: "9px 11px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    textAlign: "left",
                  }}
                >
                  {formError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={closeApplyModal}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={calculatedDays < 1}
                  style={{
                    backgroundColor: calculatedDays < 1 ? "#93c5fd" : "#0066FF",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: "600",
                    cursor: calculatedDays < 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}