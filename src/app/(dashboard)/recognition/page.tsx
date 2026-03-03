"use client";
import { useEffect, useState } from "react";

export default function RecognitionPage() {
  const [recognitions, setRecognitions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [receivedById, setReceivedById] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/recognition").then(r=>r.json()).then(d=>setRecognitions(Array.isArray(d)?d:[]));
  };
  useEffect(() => {
    load();
    fetch("/api/employees").then(r=>r.json()).then(d=>setEmployees(d.employees||[]));
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true); setError("");
    const res = await fetch("/api/recognition", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ receivedById, message }) });
    if (res.ok) { setMessage(""); setReceivedById(""); load(); }
    else { const d = await res.json(); setError(d.error||"Failed to post"); }
    setPosting(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff/60000), hours = Math.floor(diff/3600000), days = Math.floor(diff/86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:0 }}>Recognition Wall ✦</h1>
        <p style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>Celebrate your teammates publicly</p>
      </div>

      {/* Compose */}
      <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:20, marginBottom:20, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
        <form onSubmit={handlePost}>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Recognise someone</label>
            <select value={receivedById} onChange={e=>setReceivedById(e.target.value)} required
              style={{ width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, color:"#374151", background:"#fff", outline:"none" }}>
              <option value="">Choose a teammate…</option>
              {employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.department?.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>What did they do?</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} required placeholder="Share what they did that made a difference…" rows={3}
              style={{ width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, color:"#374151", resize:"none", outline:"none", boxSizing:"border-box" }} />
          </div>
          {error && <div style={{ background:"#FEE2E2", color:"#B91C1C", borderRadius:8, padding:"9px 12px", fontSize:13, marginBottom:12 }}>{error}</div>}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button type="submit" disabled={posting} style={{ background: posting?"#9CA3AF":"#4F6EF7", color:"#fff", border:"none", borderRadius:9, padding:"9px 20px", fontSize:13, fontWeight:600, cursor: posting?"not-allowed":"pointer" }}>
              {posting?"Posting…":"Post Recognition ✦"}
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {recognitions.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"#9CA3AF", background:"#fff", borderRadius:14, border:"1px solid #F3F4F6" }}>
            No recognitions yet. Be the first to appreciate a teammate!
          </div>
        ) : recognitions.map((r: any) => (
          <div key={r.id} style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"#EEF1FE", color:"#4F6EF7", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {r.givenBy?.profile?.firstName?.[0]}{r.givenBy?.profile?.lastName?.[0]}
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:"#1F2937" }}>{r.givenBy?.profile?.firstName} {r.givenBy?.profile?.lastName}</span>
                <span style={{ fontSize:12, color:"#9CA3AF" }}>recognised</span>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"#F3E8FF", color:"#7C3AED", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {r.receivedBy?.firstName?.[0]}{r.receivedBy?.lastName?.[0]}
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:"#1F2937" }}>{r.receivedBy?.firstName} {r.receivedBy?.lastName}</span>
              </div>
              <span style={{ fontSize:11, color:"#9CA3AF", flexShrink:0 }}>{timeAgo(r.createdAt)}</span>
            </div>
            <p style={{ fontSize:13, color:"#4B5563", margin:0, lineHeight:1.6 }}>"{r.message}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
