import { useState } from "react";
import logoImg from "../assets/Work X_Concepts-08.png";

export default function LoginPage({ onLogin }) {
  const [authView, setAuthView] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = authView === "login";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isLogin) {
      onLogin?.();
    } else {
      setAuthView("login");
      setPassword("");
    }
  };

  const inputStyle = {
    width: "100%",
    height: "50px",
    padding: "0 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    outline: "none",
    color: "#1e293b",
    backgroundColor: "#fff",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 500,
    textAlign: "left",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
        backgroundColor: "#f5f6fa",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          border: "1px solid #e1e5ec",
          borderRadius: "16px",
          padding: "clamp(24px, 5vw, 40px)",
          boxShadow: "0 14px 38px rgba(15, 23, 42, 0.06)",
          boxSizing: "border-box",
        }}
      >
        {/* Centered Logo */}
        <div style={{ marginBottom: "24px", textAlign: "center", display: "flex", justifyContent: "center" }}>
          <img
            src={logoImg}
            alt="WorkX Logo"
            style={{
              height: "40px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Centered Title */}
        <h2
          style={{
            margin: "0 0 10px",
            color: "#07152e",
            fontSize: "clamp(22px, 5vw, 28px)",
            lineHeight: 1.2,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {/* Centered Subtitle */}
        <p
          style={{
            margin: "0 0 clamp(24px, 5vw, 36px)",
            color: "#64748b",
            fontSize: "15px",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          {isLogin
            ? "Please sign in to access HRMS portal"
            : "Fill in the information to get started"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="auth-name" style={labelStyle}>Full Name</label>
              <input
                id="auth-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="auth-email" style={labelStyle}>Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              autoComplete="email"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label htmlFor="auth-password" style={labelStyle}>Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <button
              type="submit"
              style={{
                width: "100%",
                minHeight: "51px",
                padding: "13px 16px",
                backgroundColor: "#2860ed",
                color: "#ffffff",
                border: "none",
                borderRadius: "9px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </div>
        </form>

        <p
          style={{
            margin: "clamp(28px, 5vw, 40px) 0 0",
            color: "#64748b",
            textAlign: "center",
            fontSize: "15px",
          }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setAuthView(isLogin ? "signup" : "login")}
            style={{
              padding: 0,
              border: "none",
              background: "none",
              color: "#155eef",
              fontWeight: 600,
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}