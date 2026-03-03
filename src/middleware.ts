import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string;
    const path = req.nextUrl.pathname;
    const adminOnly = ["/employees/new", "/payroll/config", "/settings"];
    const superAdminOnly = ["/settings/roles"];
    if (superAdminOnly.some(p => path.startsWith(p)) && role !== "SUPER_ADMIN")
      return NextResponse.redirect(new URL("/dashboard", req.url));
    if (adminOnly.some(p => path.startsWith(p)) && !["ADMIN","SUPER_ADMIN"].includes(role))
      return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/dashboard/:path*","/employees/:path*","/leaves/:path*","/payroll/:path*","/recognition/:path*","/org-chart/:path*"],
};
