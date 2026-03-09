"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

function AddAssetModal({ employeeId, onDone, onClose }: any) {
  const [name, setName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!name || !deviceType || !assetTag) { setError("Name, device type and asset tag are required"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, name, deviceType, model, serialNumber, assetTag }),
    });
    if (res.ok) { onDone(); onClose(); }
    else { const d = await res.json(); setError(d.error || "Failed to save"); }
    setSaving(false);
  };

  const iStyle: any = { width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, width: 480, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "22px 28px", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Assign Device</div>
        </div>
        <div style={{ padding: "20px 28px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Device Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MacBook Pro" style={iStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Device Type</label>
            <select value={deviceType} onChange={e => setDeviceType(e.target.value)} style={iStyle}>
              <option value="">Select type…</option>
              <option value="Laptop">Laptop</option>
              <option value="Phone">Phone</option>
              <option value="Tablet">Tablet</option>
              <option value="Access Card">Access Card</option>
              <option value="Monitor">Monitor</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Model</label>
            <input value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. MacBook Pro M3 14-inch" style={iStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Serial Number</label>
            <input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="e.g. C02XG0JHJGH5" style={iStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Asset Tag</label>
            <input value={assetTag} onChange={e => setAssetTag(e.target.value)} placeholder="e.g. BF-LAP-001" style={iStyle} />
          </div>
          {error && <div style={{ background: "#FEE2E2", color: "#B91C1C", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        </div>
        <div style={{ padding: "0 28px 20px", display: "flex", gap: 10 }}>
          <button disabled={saving} onClick={save} style={{ flex: 1, background: saving ? "#9CA3AF" : "#4F6EF7", color: "#fff", border: "none", borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Assign Device"}
          </button>
          <button onClick={onClose} style={{ padding: "10px 16px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [emp, setEmp] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const isAdmin = session?.user?.role === "ADMIN" || isSuperAdmin;

  const loadAssets = () => {
    fetch(`/api/assets?employeeId=${id}`)
      .then(r => r.json())
      .then(d => setAssets(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/employees/${id}`)
      .then(r => r.json())
      .then(setEmp)
      .catch(console.error)
      .finally(() => setLoading(false));
    loadAssets();
  }, [id]);

  const markReturned = async (assetId: string) => {
    await fetch("/api/assets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: assetId, status: "RETURNED" }),
    });
    loadAssets();
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Loading…</div>;
  if (!emp) return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Employee not found.</div>;

  const initials = emp.firstName[0] + emp.lastName[0];
  const roleLabel: Record<string, string> = { SUPER_ADMIN: "Super Admin", ADMIN: "Admin", EMPLOYEE: "Employee" };
  const statusColors: Record<string, { bg: string; color: string }> = {
    ASSIGNED: { bg: "#DCFCE7", color: "#166534" },
    RETURNED: { bg: "#F3F4F6", color: "#6B7280" },
    LOST: { bg: "#FEE2E2", color: "#B91C1C" },
  };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#1F2937", fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <button onClick={() => router.push("/employees")}
        style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to Employees
      </button>

      {/* Header */}
      <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EEF1FE", color: "#4F6EF7", fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{emp.firstName} {emp.lastName}</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>{emp.designation || emp.department?.name || "—"}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{emp.user?.email}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>Employee Code</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#4F6EF7" }}>{emp.employeeCode}</div>
        </div>
      </div>

      {/* Personal Details */}
      <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Personal Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          <Field label="First Name" value={emp.firstName} />
          <Field label="Last Name" value={emp.lastName} />
          <Field label="Email" value={emp.user?.email} />
          <Field label="Phone" value={emp.phone} />
          <Field label="Date of Birth" value={emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
        </div>
      </div>

      {/* Employment Details */}
      <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Employment Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          <Field label="Role" value={roleLabel[emp.user?.role] || "Employee"} />
          <Field label="Employment Type" value={emp.employmentType?.replace("_", " ")} />
          <Field label="Designation" value={emp.designation} />
          <Field label="Department" value={emp.department?.name} />
          <Field label="Manager" value={emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : "No manager"} />
          <Field label="Joining Date" value={new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
          {isAdmin && <Field label="Salary (Annual CTC)" value={emp.salary ? "₹" + Number(emp.salary).toLocaleString("en-IN") : "—"} />}
          <Field label="Status" value={emp.status} />
        </div>
      </div>

      {/* Assets */}
      <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Assigned Devices</div>
          {isSuperAdmin && (
            <button onClick={() => setShowAssetModal(true)}
              style={{ background: "#4F6EF7", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              + Assign Device
            </button>
          )}
        </div>
        {assets.length === 0 ? (
          <div style={{ color: "#9CA3AF", fontSize: 13 }}>No devices assigned yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["Device", "Type", "Model", "Serial No.", "Asset Tag", "Assigned", "Status", ""].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {assets.map(asset => {
                const sc = statusColors[asset.status] || statusColors.ASSIGNED;
                return (
                  <tr key={asset.id} style={{ borderTop: "1px solid #F9FAFB" }}>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#1F2937" }}>{asset.name}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#4B5563" }}>{asset.deviceType}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#4B5563" }}>{asset.model || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#4B5563" }}>{asset.serialNumber || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#4B5563" }}>{asset.assetTag}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#6B7280" }}>{asset.assignedAt ? new Date(asset.assignedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{asset.status}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {isSuperAdmin && asset.status === "ASSIGNED" && (
                        <button onClick={() => markReturned(asset.id)}
                          style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showAssetModal && (
        <AddAssetModal
          employeeId={id}
          onDone={loadAssets}
          onClose={() => setShowAssetModal(false)}
        />
      )}
    </div>
  );
}
