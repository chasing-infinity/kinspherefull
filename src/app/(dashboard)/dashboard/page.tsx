"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ width:36, height:36, borderRadius:10, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginBottom:12, color }}>{icon}</div>
      <div style={{ fontSize:26, fontWeight:700, color:"#111827", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:"#9CA3AF", marginTop:4 }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    setLoading(true);
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  if (status === "loading" || loading) return (
    <div style={{ color:"#9CA3AF", paddingTop:40, textAlign:"center" }}>Loading…</div>
  );

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:0 }}>{getGreeting()}, {firstName} 👋</h1>
        <p style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>{new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
      </div>

      {isAdmin && data && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
            <StatCard icon="◎" label="Total Employees"   value={data.stats?.totalEmployees ?? 0}   color="#4F6EF7" />
            <StatCard icon="◷" label="On Leave Today"    value={data.stats?.onLeaveToday ?? 0}     color="#F97316" />
            <StatCard icon="⚑" label="Pending Approvals" value={data.stats?.pendingApprovals ?? 0} color="#F59E0B" />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:"#374151", margin:0 }}>Pending Approvals</h3>
                <Link href="/leaves?status=PENDING" style={{ fontSize:11, color:"#4F6EF7", textDecoration:"none" }}>View all →</Link>
              </div>
              {!data.recentLeaves?.length ? <p style={{ fontSize:13, color:"#9CA3AF" }}>No pending requests.</p> :
                data.recentLeaves.map((l: any) => (
                  <div key={l.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid #F9FAFB" }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"#EEF1FE", color:"#4F6EF7", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {l.employee.firstName[0]}{l.employee.lastName[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1F2937" }}>{l.employee.firstName} {l.employee.lastName}</div>
                      <div style={{ fontSize:11, color:"#9CA3AF" }}>{l.leaveType} · {l.days} day{l.days>1?"s":""}</div>
                    </div>
                    <Link href="/leaves" style={{ background:"#EEF1FE", color:"#4F6EF7", borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:600, textDecoration:"none" }}>Review</Link>
                  </div>
                ))
              }
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:"#374151", margin:"0 0 12px" }}>🎂 Upcoming Birthdays</h3>
                {!data.birthdays?.length ? <p style={{ fontSize:13, color:"#9CA3AF" }}>None in the next 30 days.</p> :
                  data.birthdays.map((e: any) => (
                    <div key={e.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:"#F3E8FF", color:"#7C3AED", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{e.firstName[0]}{e.lastName[0]}</div>
                      <span style={{ fontSize:13, color:"#374151" }}>{e.firstName} {e.lastName}</span>
                    </div>
                  ))}
              </div>
              <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:"#374151", margin:"0 0 12px" }}>🎉 Work Anniversaries</h3>
                {!data.anniversaries?.length ? <p style={{ fontSize:13, color:"#9CA3AF" }}>None in the next 30 days.</p> :
                  data.anniversaries.map((e: any) => {
                    const years = new Date().getFullYear() - new Date(e.joiningDate).getFullYear();
                    return (
                      <div key={e.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"#DCFCE7", color:"#15803D", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{e.firstName[0]}{e.lastName[0]}</div>
                        <span style={{ fontSize:13, color:"#374151" }}>{e.firstName} {e.lastName}</span>
                        <span style={{ fontSize:11, color:"#9CA3AF" }}>{years}yr</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </>
      )}

      {!isAdmin && data && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {(data.leaveBalances || []).map((b: any) => (
              <div key={b.leaveType} style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:11, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>{b.leaveType}</div>
                <div style={{ fontSize:28, fontWeight:700, color:"#111827" }}>{b.total - b.used - b.pending}</div>
                <div style={{ fontSize:11, color:"#9CA3AF" }}>of {b.total} days</div>
                {b.pending > 0 && <div style={{ fontSize:11, color:"#F59E0B", marginTop:4 }}>{b.pending} pending</div>}
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:"#374151", margin:0 }}>My Recent Requests</h3>
                <Link href="/leaves" style={{ fontSize:11, color:"#4F6EF7", textDecoration:"none" }}>View all →</Link>
              </div>
              {!data.myRequests?.length ? <p style={{ fontSize:13, color:"#9CA3AF" }}>No requests yet.</p> :
                data.myRequests.map((r: any) => (
                  <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #F9FAFB" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500, color:"#1F2937" }}>{r.leaveType} Leave</div>
                      <div style={{ fontSize:11, color:"#9CA3AF" }}>{r.days} day{r.days>1?"s":""}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background: r.status==="APPROVED"?"#DCFCE7":r.status==="REJECTED"?"#FEE2E2":"#FEF3C7", color: r.status==="APPROVED"?"#15803D":r.status==="REJECTED"?"#B91C1C":"#B45309" }}>{r.status}</span>
                  </div>
                ))
              }
            </div>
            <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:20 }}>
              <h3 style={{ fontSize:13, fontWeight:600, color:"#374151", margin:"0 0 14px" }}>Upcoming Holidays</h3>
              {!data.upcomingHolidays?.length ? <p style={{ fontSize:13, color:"#9CA3AF" }}>No upcoming holidays.</p> :
                data.upcomingHolidays.map((h: any) => (
                  <div key={h.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F9FAFB" }}>
                    <span style={{ fontSize:13, color:"#374151" }}>{h.name}</span>
                    <span style={{ fontSize:11, color:"#9CA3AF" }}>{new Date(h.date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}
