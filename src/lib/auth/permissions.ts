import { getServerSession } from "next-auth";
import { authOptions } from "./config";
import { NextResponse } from "next/server";

export type Role = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";

export function isAdminOrAbove(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { session, error: null };
}

export async function requireAdmin() {
  const { session, error } = await requireSession();
  if (error || !session) return { session: null, error: error! };
  if (!isAdminOrAbove(session.user.role as string))
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { session, error: null };
}
