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
  { type: "Casual Leave", key: "casual", total: 12, color: "#0066FF", bg: "#eff6ff" },
  { type: "Sick Leave", key: "sick", total: 10, color: "#10b981", bg: "#ecfdf5" },
  { type: "Earned Leave", key: "earned", total: 15, color: "#8b5cf6", bg: "#f5f3ff" },
];

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
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState("Casual Leave");
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
    () => countWorkingDays(formFrom, formTo),
    [formFrom, formTo]
  );

  const leaveBalances = useMemo(() => {
    return LEAVE_TYPES.map((leaveType) => {
      const approvedDays = safeHistory
        .filter(
          (item) =>
            item.type === leaveType.type &&
            item.status === "Approved"
        )
        .reduce((total, item) => {
          // Recalculate from the actual dates so older/manual entries also work.
          const days = countWorkingDays(item.from, item.to);
          return total + (days || Number(item.days) || 0);
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
    setFormType("Casual Leave");
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
        @media (max-width: 600px) {
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
        }}
      >
        <div>
          <h2 style={{ color: "#ffffff", margin: 0 }}>Leave Management</h2>
          <p style={{ color: "#cbd5e1", margin: "8px 0 0 0", fontSize: "13.5px" }}>
            Track your leave balances, view history, or apply for new time off.
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
          }}
        >
          {notice}
        </div>
      )}

      {/* DYNAMIC LEAVE BALANCE CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {leaveBalances.map((info) => (
          <div
            key={info.type}
            style={{
              ...whiteCardStyle,
              borderLeft: `4px solid ${info.color}`,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
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
              }}
            >
              <div>
                <span style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
                  {info.used} / {info.total}
                </span>
                <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px" }}>
                  days used
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
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
      <div style={{ ...whiteCardStyle, minWidth: 0 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>
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
                      <td style={{ padding: "14px 16px", fontWeight: "600", color: "#1e293b" }}>
                        {item.type}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569" }}>
                        {formatDate(item.from)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569" }}>
                        {formatDate(item.to)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569" }}>
                        {countWorkingDays(item.from, item.to) || item.days || 0} day(s)
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
                        }}
                      >
                        {item.reason}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
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
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
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
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "6px",
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

              <div className="leave-form-grid">
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
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

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
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
                }}
              >
                Calculated leave: <strong>{calculatedDays} working day(s)</strong>
                <div style={{ color: "#64748b", marginTop: "3px" }}>
                  Saturdays and Sundays are excluded. Company holidays are not yet connected.
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "6px",
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
                  style={{ resize: "vertical" }}
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
