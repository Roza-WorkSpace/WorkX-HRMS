import { useState, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, EyeOff, FileText, Download, Wallet, ReceiptText, Check } from "lucide-react";

const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));

export default function PayslipsPage({ userProfile, onDownloadPayslip, onDownloadAllPayslips }) {
  // Use a unique localStorage key per user email so different profiles hold unique INR amounts
  const userEmailKey = userProfile?.email ? userProfile.email.replace(/[^a-zA-Z0-9]/g, "_") : "default_user";
  const PAYSLIP_STORAGE_KEY = `workx_payslips_${userEmailKey}`;

  const DEFAULT_USER_PAYSLIPS = [
    { month: "September", year: 2026, currency: "INR", grossEarnings: 24219.56, totalDeductions: 4465.56, netPay: 19754, status: "Paid", payslipUrl: "" },
    { month: "August", year: 2026, currency: "INR", grossEarnings: 24219.56, totalDeductions: 4465.56, netPay: 19754, status: "Paid", payslipUrl: "" },
    { month: "July", year: 2026, currency: "INR", grossEarnings: 24219.56, totalDeductions: 4465.56, netPay: 19754, status: "Paid", payslipUrl: "" },
  ];

  const [payslips, setPayslips] = useState(() => {
    try {
      const saved = localStorage.getItem(PAYSLIP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load payslips from localStorage", e);
    }
    return DEFAULT_USER_PAYSLIPS;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPayroll, setShowPayroll] = useState(true);

  // Form input states for customization
  const safeIndex = Math.min(selectedIndex, Math.max(0, payslips.length - 1));
  const slip = payslips[safeIndex] || payslips[0];

  const [grossInput, setGrossInput] = useState(slip?.grossEarnings || 0);
  const [deductionsInput, setDeductionsInput] = useState(slip?.totalDeductions || 0);

  // Update form inputs when selected month/slip changes
  useEffect(() => {
    if (slip) {
      setGrossInput(slip.grossEarnings);
      setDeductionsInput(slip.totalDeductions);
    }
  }, [selectedIndex, slip?.grossEarnings, slip?.totalDeductions]);

  // Sync state changes to localStorage uniquely per user
  useEffect(() => {
    try {
      localStorage.setItem(PAYSLIP_STORAGE_KEY, JSON.stringify(payslips));
    } catch (e) {
      console.error("Failed to save payslips to localStorage", e);
    }
  }, [payslips, PAYSLIP_STORAGE_KEY]);

  const deductionsPercent = slip?.grossEarnings && slip.grossEarnings > 0
    ? Math.min(100, Math.round((slip.totalDeductions / slip.grossEarnings) * 100))
    : 0;
  const netPercent = 100 - deductionsPercent;

  const handleSaveCustomSalary = (e) => {
    e.preventDefault();
    const newGross = parseFloat(grossInput) || 0;
    const newDeductions = parseFloat(deductionsInput) || 0;
    const newNet = newGross - newDeductions;

    const updated = payslips.map((item, idx) => {
      if (idx === safeIndex) {
        return {
          ...item,
          grossEarnings: newGross,
          totalDeductions: newDeductions,
          netPay: newNet,
        };
      }
      return item;
    });

    setPayslips(updated);
    alert(`Successfully updated salary for ${slip.month} ${slip.year}!`);
  };

  const downloadCurrent = () => {
    if (!slip) return;
    if (onDownloadPayslip) return onDownloadPayslip(slip);
    alert(`Downloading payslip for ${slip.month} ${slip.year}...`);
  };

  const downloadAll = () => {
    if (onDownloadAllPayslips) return onDownloadAllPayslips(payslips);
    alert("Downloading multi-payslip bundle...");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", boxSizing: "border-box", background: "#ffffff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)" }}>
      {/* Top Banner */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "rgb(8, 14, 30)", padding: "22px", borderRadius: "14px", color: "#ffffff" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", color: "#94a3b8", textTransform: "uppercase" }}>
            PAYROLL CENTER {userProfile?.name ? `• ${userProfile.name}` : ""}
          </span>
          <h2 style={{ margin: "4px 0 2px 0", fontSize: "18px", color: "#ffffff" }}>My Payslips</h2>
          <p style={{ margin: 0, fontSize: "12.5px", color: "#cbd5e1" }}>View your monthly salary details and download statements.</p>
        </div>
        <div style={{ width: "38px", height: "38px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", display: "grid", placeItems: "center", color: "#ffffff" }}><Wallet size={22} /></div>
      </header>

      {/* Visibility Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: "12px" }}>
        <div>
          <strong style={{ fontSize: "13px", color: "#1e293b", display: "block" }}>Payroll information</strong>
          <span style={{ fontSize: "11.5px", color: "#64748b" }}>{showPayroll ? "Your salary details are visible" : "Your salary details are hidden"}</span>
        </div>
        <button type="button" onClick={() => setShowPayroll(v => !v)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: showPayroll ? "#dbeafe" : "#e2e8f0", border: "none", borderRadius: "999px", padding: "4px 12px 4px 4px", fontSize: "12px", fontWeight: "600", color: showPayroll ? "#1e40af" : "#475569", cursor: "pointer" }}>
          <span style={{ width: "22px", height: "22px", background: "#ffffff", borderRadius: "50%", display: "grid", placeItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            {showPayroll ? <Eye size={13} /> : <EyeOff size={13} />}
          </span>
          {showPayroll ? "Hide" : "Show"}
        </button>
      </div>

      {/* Payslip Card Section */}
      {slip ? (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Month Navigator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "8px 12px" }}>
            <button type="button" disabled={safeIndex >= payslips.length - 1} onClick={() => setSelectedIndex(i => Math.min(payslips.length - 1, i + 1))} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronLeft size={19} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#0f172a" }}><strong>{slip.month} {slip.year}</strong><CalendarDays size={17} /></div>
            <button type="button" disabled={safeIndex <= 0} onClick={() => setSelectedIndex(i => Math.max(0, i - 1))} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronRight size={19} /></button>
          </div>

          {/* Gross Earnings */}
          <div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Total Gross Earnings</span>
            <div style={{ fontSize: "24px", fontWeight: "750", color: "#0f172a" }}>{showPayroll ? money(slip.grossEarnings, slip.currency || "INR") : "••••••••"}</div>
          </div>

          {/* Chart & Breakdown Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
            <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: `conic-gradient(#0ea5a4 0 ${netPercent}%, #e34b4b ${netPercent}% 100%)`, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <div style={{ width: "56px", height: "56px", background: "#ffffff", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "9px", color: "#64748b", fontWeight: "700" }}>NET</span>
                <strong style={{ fontSize: "12px", color: "#0f172a" }}>{showPayroll ? `${netPercent}%` : "••"}</strong>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              <div>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>Total Deductions</span>
                <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#e34b4b" }}>{showPayroll ? money(slip.totalDeductions, slip.currency || "INR") : "••••••"} ({deductionsPercent}%)</div>
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>Net Pay</span>
                <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0ea5a4" }}>{showPayroll ? money(slip.netPay, slip.currency || "INR") : "••••••"} ({netPercent}%)</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button type="button" onClick={downloadCurrent} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", background: "#0f172a", color: "#fff", border: "none", fontWeight: "600", cursor: "pointer" }}>
              <FileText size={17} /> Payslip <Download size={15} />
            </button>
            <button type="button" onClick={downloadAll} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", fontWeight: "600", cursor: "pointer" }}>
              <ReceiptText size={17} /> Multi-Payslip
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No payslips found.</div>
      )}

      {/* CUSTOMIZE SALARY INPUT CARD */}
      <form onSubmit={handleSaveCustomSalary} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Customize Salary ({slip?.month} {slip?.year})</h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Adjust the gross earnings and deductions for the selected month. Changes save automatically to local storage.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Gross Earnings (₹)</label>
            <input
              type="number"
              step="any"
              value={grossInput}
              onChange={(e) => setGrossInput(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", background: "#fff", outline: "none", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Total Deductions (₹)</label>
            <input
              type="number"
              step="any"
              value={deductionsInput}
              onChange={(e) => setDeductionsInput(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", background: "#fff", outline: "none", boxSizing: "border-box" }}
              required
            />
          </div>
        </div>

        <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "8px", background: "#0066FF", color: "#fff", border: "none", fontWeight: "600", fontSize: "13px", cursor: "pointer", width: "100%" }}>
          <Check size={16} /> Update & Save Salary
        </button>
      </form>
    </div>
  );
} 