"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LeavesPage() {
  const { data: session } = useSession();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: "SICK", startDate: "", endDate: "", reason: "" });
  const [taggedApprovers, setTaggedApprovers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const loadLeaves = () => {
    const q = tab !== "ALL" ? `?status=${tab}` : "";
    fetch(`/api/leaves${q}`)
      .then(r => r.json())
      .then(d => setLeaves(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLeaves(); }, [tab]);

  useEffect(() => {
    fetch("/api/employees")
      .then(r => r.json())
      .then(d => setEmployees(d.employees || []));
  }, []);

  const handleApprove = async (id: string, action: string) => {
    const res = await fetch(`/api/leaves/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) loadLeaves();
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setFormError("");
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        taggedApprovers,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ leaveType: "SICK", startDate: "", endDate: "", reason: "" });
      setTaggedApprovers([]);
      loadLeaves();
    } else {
      const d = await res.json();
      setFormError(d.error || "Something went wrong");
    }
    setSubmitting(false);
  };

  const toggleApprover = (id: string) => {
    setTaggedApprovers(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const statusColor: Record<string, { bg: string; c: string }> = {
    PENDING: { bg: "#FEF3C7", c: "#B45309" },
    APPROVED: { bg: "#DCFCE7", c: "#15803D" },
    REJECTED: { bg: "#FEE2E2", c: "#B91C1C" },
    CANCELLED: { bg: "#F3F4F6", c: "#374151" },
  };

  const leaveTypeLabel: Record<string, string> = {
    SICK: "Sick Leave",
    PAID: "Earned Leave",
  };

  const approverEmployees = employees.filter(e => e.id !== session?.user?.id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Leave Management</h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>{isAdmin ? "Review and approve team leave requests" : "Apply for leave and track your requests"}</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ background: "#4F6EF7", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Apply Leave
        </button>
      </div>

      {/* Apply Leave Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowForm(false)}>
          <div style={{ background: "#fff", borderRadius: 16, width: 480, maxHeight: "90vh", overflow: "auto", padding: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>Apply for Leave</h2>
            <form onSubmit={handleApply}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Leave Type</label>
                <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
                  <option value="SICK">Sick Leave</option>
                  <option value="PAID">Earned Leave</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>From</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>To</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Reason</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required placeholder="Brief reason for leave…" rows={3}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />
              </div>

              {/* Tag Approvers */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Tag Approvers <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {approverEmployees.map((emp: any) => {
                    const selected = taggedApprovers.includes(emp.id);
                    return (
                      <button key={emp.id} type="button" onClick={() => toggleApprover(emp.id)}
                        style={{
                          padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid",
                          background: selected ? "#4F6EF7" : "#F9FAFB",
                          color: selected ? "#fff" : "#374151",
                          borderColor: selected ? "#4F6EF7" : "#E5E7EB",
                        }}>
                        {emp.firstName} {emp.lastName}
                      </button>
                    );
                  })}
                </div>
                {taggedApprovers.length > 0 && (
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
                    {taggedApprovers.length} approver{taggedApprovers.length > 1 ? "s" : ""} tagged
                  </div>
                )}
              </div>

              {formError && <div style={{ background: "#FEE2E2", color: "#B91C1C", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>{formError}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={submitting} style={{ flex: 1, background: submitting ? "#9CA3AF" : "#4F6EF7", color: "#fff", border: "none", borderRadius: 9, padding: 10, fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Submitting…" : "Submit Request"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 16px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 9, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#F3F4F6", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize",
            background: tab === t ? "#fff" : "transparent", color: tab === t ? "#1F2937" : "#9CA3AF",
            boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
          }}>
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Loading…</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F9FAFB" }}>
              {[isAdmin ? "Employee" : "", "Type", "From", "To", "Days", "Reason", "Approvers", "Status", isAdmin ? "Action" : ""].filter(Boolean).map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>No leave requests found.</td></tr>
              ) : leaves.map(l => {
                const sc = statusColor[l.status] || statusColor.PENDING;
                const taggedNames = (l.taggedApprovers || []).map((tid: string) => {
                  const emp = employees.find(e => e.id === tid);
                  return emp ? `${emp.firstName} ${emp.lastName}` : null;
                }).filter(Boolean);

                return (
                  <tr key={l.id} style={{ borderTop: "1px solid #F9FAFB" }}>
                    {isAdmin && (
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>{l.employee?.firstName} {l.employee?.lastName}</div>
                      </td>
                    )}
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#4B5563" }}>{leaveTypeLabel[l.leaveType] || l.leaveType}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280" }}>{new Date(l.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280" }}>{new Date(l.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{l.days}d</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280", maxWidth: 160 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.reason}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280", maxWidth: 160 }}>
                      {taggedNames.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {taggedNames.map((name: string) => (
                            <span key={name} style={{ background: "#EEF1FE", color: "#4F6EF7", fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 20 }}>{name}</span>
                          ))}
                        </div>
                      ) : <span style={{ color: "#D1D5DB" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: sc.bg, color: sc.c, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{l.status}</span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: "12px 16px" }}>
                        {l.status === "PENDING" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleApprove(l.id, "APPROVED")} style={{ background: "#DCFCE7", color: "#15803D", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                            <button onClick={() => handleApprove(l.id, "REJECTED")} style={{ background: "#FEE2E2", color: "#B91C1C", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
