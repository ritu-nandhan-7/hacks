import { useState } from "react";
import type { SessionUser } from "../types/userData";

const DEFAULT_EMAIL = "demo@habospace.com";
const DEFAULT_PASSWORD = "123456";
const DEFAULT_USER_ID = "default-user";

export default function LoginScreen({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canContinue = email.trim().length > 0 && password.length > 0;

  const handleEmailLogin = async () => {
    if (!canContinue) return;

    setError(null);
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail !== DEFAULT_EMAIL || password !== DEFAULT_PASSWORD) {
      setError("Use the default credentials shown below to continue.");
      return;
    }

    onLogin({
      id: DEFAULT_USER_ID,
      email: DEFAULT_EMAIL,
      isGuest: true,
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1f2321",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "inherit",
    }}>
      {/* Subtle background texture */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `radial-gradient(circle at 30% 20%, rgba(124,154,126,0.06) 0%, transparent 50%),
                          radial-gradient(circle at 75% 80%, rgba(124,154,126,0.04) 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%",
        maxWidth: "360px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0",
        position: "relative",
      }}>

        {/* Logo mark */}
        <div style={{
          width: "52px",
          height: "52px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #7c9a7e 0%, #4a6b4c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "28px",
          boxShadow: "0 8px 32px rgba(124,154,126,0.3)",
          fontSize: "22px",
        }}>
          🌱
        </div>

        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: "28px",
          color: "#f1efe9",
          margin: "0 0 8px",
          textAlign: "center",
        }}>
          Habo Space
        </h1>

        <p style={{
          color: "#a8a6a2",
          fontSize: "14px",
          margin: "0 0 40px",
          textAlign: "center",
        }}>
          No pressure. Just progress.
        </p>

        {/* Card */}
        <div style={{
          width: "100%",
          background: "#2a2f2c",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 16px 64px rgba(0,0,0,0.4)",
          boxSizing: "border-box",
        }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Email */}
            <div>
              <label style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#a8a6a2",
                display: "block",
                marginBottom: "8px",
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${focused === "email" ? "rgba(124,154,126,0.5)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "14px",
                  color: "#f1efe9",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#a8a6a2",
                display: "block",
                marginBottom: "8px",
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canContinue) {
                    void handleEmailLogin();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${focused === "password" ? "rgba(124,154,126,0.5)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "14px",
                  color: "#f1efe9",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            {/* Continue button */}
            <button
              onClick={() => {
                void handleEmailLogin();
              }}
              disabled={!canContinue}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                marginTop: "8px",
                background: canContinue ? "#7c9a7e" : "rgba(255,255,255,0.06)",
                color: canContinue ? "#1f2321" : "#a8a6a2",
                fontSize: "15px",
                fontWeight: 700,
                cursor: canContinue ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                boxShadow: canContinue ? "0 4px 20px rgba(124,154,126,0.35)" : "none",
              }}
            >
              Continue
            </button>

            {error && (
              <p style={{ color: "#c4855a", fontSize: "12px", margin: "6px 2px 0" }}>
                {error}
              </p>
            )}

          </div>

          <div style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid rgba(124,154,126,0.35)",
            background: "rgba(124,154,126,0.08)",
            color: "#d6e6d7",
            fontSize: "12px",
            lineHeight: 1.6,
          }}>
            <strong>Default Login:</strong><br />
            Email: {DEFAULT_EMAIL}<br />
            Password: {DEFAULT_PASSWORD}
          </div>

        </div>

        <p style={{
          color: "#a8a6a2",
          fontSize: "12px",
          marginTop: "20px",
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          By continuing, you agree to build better habits 🌿
        </p>

      </div>
    </div>
  );
}