import logoImg from "../assets/WorkX_Concepts-07.png";

export default function LoginPage({ onLogin }) {
  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#03091e" }}>
      <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "16px", textAlign: "center", width: "360px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <img src={logoImg} alt="Company Logo" style={{ height: "50px", width: "auto", objectFit: "contain" }} />
        </div>
        <h2 style={{ marginTop: "10px", color: "#0f172a", fontSize: "20px" }}>Welcome Back</h2>
        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>Sign in to access your WorkX HR Portal</p>
        <button onClick={onLogin} style={{ width: "100%", padding: "12px", backgroundColor: "#0066FF", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
          Sign In to Portal
        </button>
      </div>
    </div>
  );
}
