"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const router = useRouter();

  useEffect(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/employees${q}`).then(r => r.json()).then(d => setEmployees(d.employees || [])).finally(() => setLoading(false));
  }, [search]);

  const roleLabel: Record<string,string> = { SUPER_ADMIN:"Super Admin", ADMIN:"Admin", EMPLOYEE:"Employee" };
  const roleColors: Record<string,{bg:string;color:string}> = { SUPER_ADMIN:{bg:"#EEF1FE",color:"#3451D1"}, ADMIN:{bg:"#F3E8FF",color:"#7C3AED"}, EMPLOYEE:{bg:"#F3F4F6",color:"#374151"} };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:0 }}>Employees</h1>
          <p style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>{employees.length} people · Bipolar Factory</p>
        </div>
        {isAdmin && <Link href="/employees/new" style={{ background:"#4F6EF7", color:"#fff", borderRadius:10, padding:"9px 18px", fontSize:13, fontWeight:600, textDecoration:"none" }}>+ Add Employee</Link>}
      </div>

      <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #F3F4F6" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or department…"
            style={{ width:300, padding:"7px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, color:"#374151", outline:"none", background:"#F9FAFB" }} />
        </div>

        {loading ? <div style={{ padding:40, textAlign:"center", color:"#9CA3AF" }}>Loading…</div> : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"#F9FAFB" }}>
              {["Employee","Department","Role","Type","Joined",isAdmin?"Salary":""].filter(Boolean).map(h => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {employees.map(emp => {
                const rc = roleColors[emp.user?.role] || roleColors.EMPLOYEE;
                return (
                  <tr key={emp.id}
                    onClick={() => router.push(`/employees/${emp.id}`)}
                    style={{ borderTop:"1px solid #F9FAFB", cursor:"pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background="#F9FAFB")}
                    onMouseLeave={e => (e.currentTarget.style.background="")}>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:"50%", background:"#EEF1FE", color:"#4F6EF7", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:"#1F2937" }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize:11, color:"#9CA3AF" }}>{emp.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#4B5563" }}>{emp.department?.name || "—"}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ background:rc.bg, color:rc.color, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20 }}>{roleLabel[emp.user?.role] || "Employee"}</span>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#6B7280" }}>{emp.employmentType?.replace("_"," ") || "—"}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#6B7280" }}>{new Date(emp.joiningDate).toLocaleDateString("en-IN", { month:"short", year:"numeric" })}</td>
                    {isAdmin && <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#374151" }}>{emp.salary ? "₹" + Number(emp.salary).toLocaleString("en-IN") : "—"}</td>}
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
