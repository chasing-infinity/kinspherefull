import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, isAdminOrAbove } from "@/lib/auth/permissions";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const payslip = await db.payslip.findUnique({ where: { id: params.id }, include: { employee: { select: { firstName:true, lastName:true, employeeCode:true, user: { select: { email:true } }, department: { select: { name:true } }, joiningDate:true } } } });
  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdminOrAbove(session.user.role)) {
    const profile = await db.employeeProfile.findUnique({ where: { userId: session.user.id } });
    if (payslip.employeeId !== profile?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (payslip.status === "GENERATED") await db.payslip.update({ where: { id: params.id }, data: { status: "VIEWED", viewedAt: new Date() } });
  }
  return NextResponse.json(payslip);
}
