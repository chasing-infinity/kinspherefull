"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", role:"EMPLOYEE", departmentId:"", managerId:"", joiningDate:new Date().toISOString().split("T")[0], employmentType:"FULL_TIME", phone:"", dateOfBirth:"" });

  useEffect(() => {
    fetch("/api/employees").then(r=>r.json()).then(d => setManagers(d.employees||[]));
  }, []);

  const set = (k: string, v: string) => setForm(f => ({...f, [k]:v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/employees", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, joiningDate: new Date(form.joiningDate).toISOString(), dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined}) });
    if (res.ok) { router.push("/employees"); } else { const d = await res.json(); setError(d.error?.fieldErrors ? Object.values(d.error.fieldErrors).flat().join(", ") : "Something went wrong"); setLoading(false); }
  };

  const Label = ({ children }: any) => <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>{children}</label>;
  const Input = ({ field, type="text", placeholder="" }: any) => (
    <input type={type} value={form[field as keyof typeof form]} onChange={e=>set(field,e.target.value)} placeholder={placeholder}
      style={{ width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" }} />
  );

  return (
    <div style={{ maxWidth:640 }}>
      <div style={{ marginBottom:28 }}>
        <button onClick={()=>router.back()} style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:13, padding:0, marginBottom:8 }}>← Back</button>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:0 }}>Add New Employee</h1>
        <p style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>They'll receive a welcome email with their login details. Default password: Welcome@123</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:16 }}>Personal Details</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><Label>First Name *</Label><Input field="firstName" placeholder="Priya" /></div>
            <div><Label>Last Name *</Label><Input field="lastName" placeholder="Sharma" /></div>
            <div><Label>Email *</Label><Input field="email" type="email" placeholder="priya@bipolarfactory.com" /></div>
            <div><Label>Phone</Label><Input field="phone" placeholder="+91 98765 43210" /></div>
            <div><Label>Date of Birth</Label><Input field="dateOfBirth" type="date" /></div>
          </div>
        </div>

        <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:16 }}>Employment Details</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <Label>Role *</Label>
              <select value={form.role} onChange={e=>set("role",e.target.value)} style={{ width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", background:"#fff" }}>
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <Label>Employment Type</Label>
              <select value={form.employmentType} onChange={e=>set("employmentType",e.target.value)} style={{ width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", background:"#fff" }}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
            <div><Label>Joining Date *</Label><Input field="joiningDate" type="date" /></div>
            <div>
              <Label>Manager</Label>
              <select value={form.managerId} onChange={e=>set("managerId",e.target.value)} style={{ width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", background:"#fff" }}>
                <option value="">No manager</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && <div style={{ background:"#FEE2E2", color:"#B91C1C", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{error}</div>}

        <div style={{ display:"flex", gap:10 }}>
          <button type="submit" disabled={loading} style={{ flex:1, background: loading?"#9CA3AF":"#4F6EF7", color:"#fff", border:"none", borderRadius:10, padding:"11px", fontSize:14, fontWeight:600, cursor: loading?"not-allowed":"pointer" }}>
            {loading ? "Adding employee…" : "Add Employee"}
          </button>
          <button type="button" onClick={()=>router.back()} style={{ padding:"11px 20px", background:"#F3F4F6", color:"#374151", border:"none", borderRadius:10, fontSize:14, cursor:"pointer" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
