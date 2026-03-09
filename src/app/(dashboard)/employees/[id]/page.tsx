"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

export default function EmployeeProfilePage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [emp, setEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!id) return;
    fetch(`/api/employees/${id}`)
      .then(r => r.json())
      .then(setEmp)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#9CA3AF" }}>Loading…</div>;
  if (!emp) return <div style={{ padding:40, textAlign:"center", color:"#9CA3AF" }}>Employee not found.</div>;

  const initials = emp.firstName[0] + emp.lastName[0];
  const roleLabel: Record<string,string> = { SUPER_ADMIN:"Super Admin", ADMIN:"Admin", EMPLOYEE:"Employee" };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:14, color:"#1F2937", fontWeight:500 }}>{value || "—"}</div>
    </div>
  );

  return (
    <div style={{ maxWidth:720 }}>
      {/* Back button */}
      <button onClick={() => router.push("/employees")}
        style={{ background:"none", border:"none", color:"#9CA3AF", fontSize:13, cursor:"pointer", marginBottom:20, padding:0, display:"flex", alignItems:"center", gap:6 }}>
        ← Back to Employees
      </button>

      {/* Header */}
      <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:24, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:20 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"#EEF1FE", color:"#4F6EF7", fontSize:22, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:700, color:"#111827" }}>{emp.firstName} {emp.lastName}</div>
          <div style={{ fontSize:13, color:"#9CA3AF", marginTop:2 }}>{emp.designation || emp.department?.name || "—"}</div>
          <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>{emp.user?.email}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11, color:"#9CA3AF", marginBottom:4 }}>Employee Code</div>
          <div style={{ fontSize:15, fontWeight:700, color:"#4F6EF7" }}>{emp.employeeCode}</div>
        </div>
      </div>

      {/* Personal Details */}
      <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:24, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:18 }}>Personal Details</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
          <Field label="First Name" value={emp.firstName} />
          <Field label="Last Name" value={emp.lastName} />
          <Field label="Email" value={emp.user?.email} />
          <Field label="Phone" value={emp.phone} />
          <Field label="Date of Birth" value={emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : "—"} />
        </div>
      </div>

      {/* Employment Details */}
      <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:24, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:18 }}>Employment Details</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
          <Field label="Role" value={roleLabel[emp.user?.role] || "Employee"} />
          <Field label="Employment Type" value={emp.employmentType?.replace("_", " ")} />
          <Field label="Designation" value={emp.designation} />
          <Field label="Department" value={emp.department?.name} />
          <Field label="Manager" value={emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : "No manager"} />
          <Field label="Joining Date" value={new Date(emp.joiningDate).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })} />
          {isAdmin && <Field label="Salary (Annual CTC)" value={emp.salary ? "₹" + Number(emp.salary).toLocaleString("en-IN") : "—"} />}
          <Field label="Status" value={emp.status} />
        </div>
      </div>
    </div>
  );
}
