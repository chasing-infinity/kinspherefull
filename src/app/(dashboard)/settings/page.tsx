"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = async () => {
    setError(""); setSuccess("");
    if (newPw !== confirm) { setError("New passwords do not match"); return; }
    if (newPw.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    });
    const d = await res.json();
    if (res.ok) { setSuccess("Password changed successfully!"); setCurrent(""); setNewPw(""); setConfirm(""); }
    else setError(d.error || "Failed to change password");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>Manage your account</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Change Password</div>
        <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>Choose a strong password</div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Current Password</label>
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>New Password</label>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Confirm New Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        {error && <div style={{ background: "#FEE2E2", color: "#B91C1C", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>{error}</div>}
        {success && <div style={{ background: "#DCFCE7", color: "#166534", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>{success}</div>}

        <button onClick={handleChange} disabled={loading || !current || !newPw || !confirm}
          style={{ width: "100%", background: loading || !current || !newPw || !confirm ? "#9CA3AF" : "#4F6EF7", color: "#fff", border: "none", borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Changing…" : "Change Password"}
        </button>
      </div>
    </div>
  );
}
