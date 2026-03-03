import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionProvider } from "./SessionProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <SessionProvider session={session}>
      <div style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar user={session.user as any} />
        <main style={{ marginLeft:220, flex:1, padding:"28px 32px", minHeight:"100vh" }}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
