import {
  CalendarCheck, Plane, Clock, Calendar, Heart, MoreVertical,
  ChevronRight, FileText, FileCode, User
} from "lucide-react";
import { whiteCardStyle } from "../App";

export function MetricCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div style={whiteCardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>{label}</div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>{value}</div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{sub}</div>
        </div>
      </div>
    </div>
  );
}

export function LegendItem({ color, label, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "8px",
        fontSize: "12px",
        color: "#475569",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontWeight: "500", marginRight: "auto" }}>{label}</span>
      <span style={{ fontWeight: "700", color: "#0f172a" }}>{count}</span>
    </div>
  );
}

export function LeaveMiniCard({ icon: Icon, title, count, bg, iconColor }) {
  return (
    <div style={{ backgroundColor: bg, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon size={16} color={iconColor} />
        <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>{title}</span>
      </div>
      <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{count}</div>
      <span style={{ fontSize: "10px", color: "#64748b" }}>days left</span>
    </div>
  );
}

export function EventRow({ date, title, isPast = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: isPast ? 0.45 : 1 }}>
      <div style={{ fontSize: "12px", fontWeight: "700", color: isPast ? "#94a3b8" : "#0066FF", width: "45px" }}>
        {date}
      </div>
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isPast ? "#cbd5e1" : "#0066FF",
        }}
      />
      <div
        style={{
          fontSize: "13px",
          color: isPast ? "#94a3b8" : "#1e293b",
          fontWeight: "500",
          textDecoration: isPast ? "line-through" : "none",
        }}
      >
        {title}
      </div>
    </div>
  );
}

export function QuickActionBtn({ icon: Icon, label, bg, iconColor, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backgroundColor: bg, border: "none", borderRadius: "12px",
        padding: "14px", cursor: "pointer", textAlign: "left"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Icon size={18} color={iconColor} />
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{label}</span>
      </div>
      <ChevronRight size={16} color="#94a3b8" />
    </button>
  );
}