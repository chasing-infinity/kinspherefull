"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F9FAFB" }}>
      <div style={{ width:400, background:"#fff", borderRadius:18, boxShadow:"0 4px 24px rgba(0,0,0,0.08)", padding:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
          <div style={{ width:36, height:36, background:"#4F6EF7", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:18 }}>⬡</div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"#111827" }}>KinSphere</div>
            <div style={{ fontSize:11, color:"#9CA3AF" }}>Bipolar Factory</div>
          </div>
        </div>

        <h1 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:6 }}>Welcome back</h1>
        <p style={{ fontSize:13, color:"#6B7280", marginBottom:28 }}>Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@bipolarfactory.com"
              style={{ width:"100%", padding:"10px 14px", border:"1px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={{ width:"100%", padding:"10px 14px", border:"1px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box" }} />
          </div>

          {error && (
            <div style={{ background:"#FEE2E2", color:"#B91C1C", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ width:"100%", background: loading ? "#9CA3AF" : "#4F6EF7", color:"white", border:"none", borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop:24, padding:16, background:"#F9FAFB", borderRadius:10, fontSize:12, color:"#6B7280" }}>
          <div style={{ fontWeight:600, marginBottom:6, color:"#374151" }}>Demo accounts:</div>
          <div>admin@bipolarfactory.com / Admin@123</div>
          <div style={{ marginTop:4 }}>priya@bipolarfactory.com / Welcome@123</div>
        </div>
      </div>
    </div>
  );
}
