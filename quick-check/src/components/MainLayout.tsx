import React from "react";

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: "100vh",
      padding: "40px 20px",
    }}
  >
    <div style={{ width: "100%", maxWidth: "600px" }}>
      {children}
    </div>
  </div>
);