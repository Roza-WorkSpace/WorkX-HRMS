import { useState } from "react";
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

const LEAVE_COLORS = {
  "Casual Leave": { color: "#0066FF", bg: "#eff6ff" },
  "Sick Leave": { color: "#10b981", bg: "#ecfdf5" },
  "Earned Leave": { color: "#8b5cf6", bg: "#f5f3ff" },
};

export default function LeavePage({
  leaveHistory,
  setLeaveHistory,
  leaveSummary,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState("Casual Leave");
  const [formFrom, setFormFrom] = useState("");
  const [formTo, setFormTo] = useState("");
  const [formDays, setFormDays] = useState(1);
  const [formReason, setFormReason] = useState("");

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!formFrom || !formTo || !formReason) return;

    const days = Number(formDays);
    if (!days || days < 1) return;

    const newLeave = {
      id: Date.now(),
      type: formType,
      from: formFrom,
      to: formTo,
      days,
      reason: formReason,
      status: "Pending",
    };

    setLeaveHistory([newLeave, ...leaveHistory]);
    setIsModalOpen(false);

    setFormType("Casual Leave");
    setFormFrom("");
    setFormTo("");
    setFormDays(1);
    setFormReason("");
  };

  const handleDeleteLeave = (id) => {
    setLeaveHistory(leaveHistory.filter((item) => item.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setLeaveHistory(
      leaveHistory.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#ecfdf5", color: "#059669", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
            <CheckCircle2 size={14} /> Approved
          </span>
        );
      case "Pending":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#fffbeb", color: "#d97706", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
            <Clock size={14} /> Pending
          </span>
        );
      case "Rejected":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#fef2f2", color: "#dc2626", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const dynamicCards = [
    { type: "Casual Leave", key: "casual" },
    { type: "Sick Leave", key: "sick" },
    { type: "Earned Leave", key: "earned" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
      {/* HEADER */}
      <div style={{ ...whiteCardStyle, backgroundColor: "rgb(8, 14, 30)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ color: "#ffffff", margin: 0 }}>Leave Management</h2>
          <p style={{ color: "#cbd5e1", margin: "8px 0 0 0", fontSize: "13.5px" }}>
            Track your leave balances, view history, or apply for new time off.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: "#0066FF", color: "#ffffff", border: "none", borderRadius: "8px", padding: "10px 18px", fontSize: "13.5px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,102,255,0.2)" }}
        >
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {/* DYNAMIC CARDS FORMATTED AS: Used leave / Total Leave */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {dynamicCards.map(({ type, key }) => {
          const info = leaveSummary?.[key] || { remaining: 0, total: 0, used: 0 };
          const theme = LEAVE_COLORS[type];

          return (
            <div key={type} style={{ ...whiteCardStyle, borderLeft: `4px solid ${theme.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{type}</span>
                <div style={{ backgroundColor: theme.bg, color: theme.color, padding: "6px", borderRadius: "8px" }}>
                  <Calendar size={18} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <span style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
                    {info.used} / {info.total}
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px" }}>days used</span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Left: <strong style={{ color: "#334155" }}>{info.remaining}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LEAVE HISTORY TABLE */}
      <div style={whiteCardStyle}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>Leave History</h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Leave Type</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>From</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>To</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Days</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Reason</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {leaveHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "32px 24px", color: "#64748b" }}>
                    No leave history found.
                  </td>
                </tr>
              ) : (
                leaveHistory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: "600", color: "#1e293b" }}>{item.type}</td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>{item.from}</td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>{item.to}</td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>{item.days} day(s)</td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>{item.reason}</td>
                    <td style={{ padding: "14px 16px" }}>{getStatusBadge(item.status)}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "center" }}>
                        {item.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(item.id, "Approved")}
                              style={{ backgroundColor: "#ecfdf5", color: "#059669", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, "Rejected")}
                              style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteLeave(item.id)}
                          style={{ backgroundColor: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
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

      {/* MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", width: "400px", maxWidth: "90%", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Apply for Leave</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Leave Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13.5px" }}
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    From Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Oct 2026"
                    value={formFrom}
                    onChange={(e) => setFormFrom(e.target.value)}
                    required
                    style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13.5px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    To Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 16 Oct 2026"
                    value={formTo}
                    onChange={(e) => setFormTo(e.target.value)}
                    required
                    style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Number of Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={formDays}
                  onChange={(e) => setFormDays(e.target.value)}
                  required
                  style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13.5px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                  Reason
                </label>
                <textarea
                  placeholder="Enter reason for leave..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  required
                  rows="3"
                  style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13.5px", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "10px 16px", borderRadius: "8px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "#0066FF", color: "#ffffff", border: "none", padding: "10px 16px", borderRadius: "8px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" }}
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