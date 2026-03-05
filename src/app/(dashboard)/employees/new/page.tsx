"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NewEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [employmentType, setEmploymentType] = useState("FULL_TIME");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [departmentId, setDepartmentId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [designation, setDesignation] = useState("");

  useEffect(() => {
    fetch("/api/employees")
      .then(r => r.json())
      .then(d => setManagers(d.employees || []));
    fetch("/api/departments")
      .then(r => r.json())
      .then(d => setDepartments(d.departments || []));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName, lastName, email, phone, dateOfBirth: dateOfBirth || undefined,
        role, employmentType, joiningDate: new Date(joiningDate).toISOString(),
        departmentId: departmentId || undefined,
        managerId: managerId || undefined,
        designation: designation || undefined,
      }),
    });
    if (res.ok) {
      router.push("/employees");
    } else {
      const d = await res.json();
      setError(d.error?.fieldErrors ? Object.values(d.error.fieldErrors).flat().join(", ") : d.error || "Something went wrong");
      setLoading(false);
    }
  };

  const inputStyle = { width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" as const };
  const selectStyle = { width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", background:"#fff" };
  const Label = ({ children }: any) => <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>{children}</label>;

  return (
    <div style={{ maxWidth:640 }}>
      <div style={{ marginBottom:28 }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:13, padding:0, marginBottom:8 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:0 }}>Add New Employee</h1>
        <p style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>Default password: Welcome@123</p>
      </div>

      <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:24, marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:16 }}>Personal Details</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div><Label>First Name *</Label><input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Priya" /></div>
          <div><Label>Last Name *</Label><input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sharma" /></div>
          <div><Label>Email *</Label><input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@bipolarfactory.com" /></div>
          <div><Label>Phone</Label><input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
          <div><Label>Date of Birth</Label><input style={inputStyle} type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} /></div>
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:24, marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:16 }}>Employment Details</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div>
            <Label>Role *</Label>
            <select style={selectStyle} value={role} onChange={e => setRole(e.target.value)}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div>
            <Label>Employment Type</Label>
            <select style={selectStyle} value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>
          <div><Label>Joining Date *</Label><input style={inputStyle} type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} /></div>
          <div><Label>Designation</Label><input style={inputStyle} value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Frontend Engineer" /></div>
          <div>
            <Label>Department</Label>
            <select style={selectStyle} value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Manager</Label>
            <select style={selectStyle} value={managerId} onChange={e => setManagerId(e.target.value)}>
              <option value="">No manager</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && <div style={{ background:"#FEE2E2", color:"#B91C1C", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{error}</div>}

      <div style={{ display:"flex", gap:10 }}>
        <button onClick={handleSubmit} disabled={loading} style={{ flex:1, background: loading?"#9CA3AF":"#4F6EF7", color:"#fff", border:"none", borderRadius:10, padding:11, fontSize:14, fontWeight:600, cursor: loading?"not-allowed":"pointer" }}>
          {loading ? "Adding employee…" : "Add Employee"}
        </button>
        <button onClick={() => router.back()} style={{ padding:"11px 20px", background:"#F3F4F6", color:"#374151", border:"none", borderRadius:10, fontSize:14, cursor:"pointer" }}>Cancel</button>
      </div>
    </div>
  );
}
