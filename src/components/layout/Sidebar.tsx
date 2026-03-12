"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const BPF_LOGO = "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";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: "▦", roles: ["EMPLOYEE", "ADMIN", "SUPER_ADMIN"] },
  { href: "/employees",   label: "Employees",   icon: "◎", roles: ["SUPER_ADMIN"] },
  { href: "/leaves",      label: "Leave",       icon: "◷", roles: ["EMPLOYEE", "ADMIN", "SUPER_ADMIN"] },
  { href: "/payroll",     label: "Payroll",     icon: "₹", roles: ["EMPLOYEE", "ADMIN", "SUPER_ADMIN"] },
  { href: "/recognition", label: "Recognition", icon: "✦", roles: ["EMPLOYEE", "ADMIN", "SUPER_ADMIN"] },
  { href: "/org-chart",   label: "Org Chart",   icon: "⬡", roles: ["EMPLOYEE", "ADMIN", "SUPER_ADMIN"] },
  { href: "/settings",    label: "Settings",    icon: "⚙", roles: ["EMPLOYEE", "ADMIN", "SUPER_ADMIN"] },
];

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  const path = usePathname();
  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const visibleNav = NAV.filter(n => n.roles.includes(user.role));

  return (
    <div style={{ width: 220, background: "#fff", borderRight: "1px solid #F3F4F6", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 10 }}>
      {/* Logo */}
      <div style={{ padding: "18px 20px", borderBottom: "1px solid #F9FAFB" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={`data:image/jpeg;base64,${BPF_LOGO}`}
            alt="Bipolar Factory"
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>KinSphere</div>
            <div style={{ fontSize: 10, color: "#9CA3AF" }}>Bipolar Factory</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {visibleNav.map(item => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9,
              background: active ? "#EEF1FE" : "transparent",
              color: active ? "#4F6EF7" : "#6B7280",
              fontSize: 13, fontWeight: active ? 600 : 400, textDecoration: "none", marginBottom: 2
            }}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* User */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid #F9FAFB" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEF1FE", color: "#4F6EF7", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name || user.email}</div>
            <div style={{ fontSize: 10, color: "#9CA3AF" }}>{user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ADMIN" ? "Admin" : "Employee"}</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} title="Sign out"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 14, padding: 4 }}>⏻</button>
        </div>
      </div>
    </div>
  );
}
