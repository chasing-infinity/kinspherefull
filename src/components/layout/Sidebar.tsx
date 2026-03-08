"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href:"/dashboard",    label:"Dashboard",    icon:"▦" },
  { href:"/employees",    label:"Employees",    icon:"◎" },
  { href:"/leaves",       label:"Leave",        icon:"◷" },
  { href:"/payroll",      label:"Payroll",      icon:"₹" },
  { href:"/recognition",  label:"Recognition",  icon:"✦" },
  { href:"/org-chart",    label:"Org Chart",    icon:"⬡" },
  { href:"/settings",     label:"Settings",     icon:"⚙" },
];

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  const path = usePathname();
  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const visibleNav = isAdmin ? NAV : NAV.filter(n => ["/dashboard","/leaves","/payroll","/recognition","/settings"].includes(n.href));

  return (
    <div style={{ width:220, background:"#fff", borderRight:"1px solid #F3F4F6", display:"flex", flexDirection:"column", height:"100vh", position:"fixed", left:0, top:0, zIndex:10 }}>
      {/* Logo */}
      <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid #F9FAFB" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, background:"#4F6EF7", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:15 }}>⬡</div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:"#111827", letterSpacing:"-0.3px" }}>KinSphere</div>
            <div style={{ fontSize:10, color:"#9CA3AF" }}>Bipolar Factory</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
        {visibleNav.map(item => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{
              display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9,
              background: active ? "#EEF1FE" : "transparent",
              color: active ? "#4F6EF7" : "#6B7280",
              fontSize:13, fontWeight: active ? 600 : 400, textDecoration:"none", marginBottom:2
            }}>
              <span style={{ fontSize:14, width:18, textAlign:"center" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* User */}
      <div style={{ padding:"12px 14px", borderTop:"1px solid #F9FAFB" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"#EEF1FE", color:"#4F6EF7", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name || user.email}</div>
            <div style={{ fontSize:10, color:"#9CA3AF" }}>{user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ADMIN" ? "Admin" : "Employee"}</div>
          </div>
          <button onClick={() => signOut({ callbackUrl:"/login" })} title="Sign out"
            style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:14, padding:4 }}>⏻</button>
        </div>
      </div>
    </div>
  );
}
