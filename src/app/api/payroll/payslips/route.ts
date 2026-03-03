import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, isAdminOrAbove } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();
  if (isAdminOrAbove(session.user.role)) {
    const payslips = await db.payslip.findMany({ where: { year }, include: { employee: { select: { firstName:true, lastName:true, employeeCode:true, department: { select: { name:true } } } } }, orderBy: [{ year:"desc" }, { month:"desc" }] });
    return NextResponse.json(payslips);
  }
  const profile = await db.employeeProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const payslips = await db.payslip.findMany({ where: { employeeId: profile.id, year }, orderBy: [{ year:"desc" }, { month:"desc" }] });
  return NextResponse.json(payslips);
}
