import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, isAdminOrAbove } from "@/lib/auth/permissions";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (!isAdminOrAbove(session.user.role)) {
    const self = await db.employeeProfile.findUnique({ where: { userId: session.user.id } });
    if (self?.id !== params.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const emp = await db.employeeProfile.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { user: { select: { email:true, role:true } }, department:true, manager: { select: { id:true, firstName:true, lastName:true } }, reports: { select: { id:true, firstName:true, lastName:true } }, leaveBalances: true, assets:true, onboardingChecklist:true },
  });
  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...emp, salary: isAdminOrAbove(session.user.role) ? emp.salary : undefined });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (!isAdminOrAbove(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const emp = await db.employeeProfile.update({ where: { id: params.id }, data: body });
  return NextResponse.json(emp);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (!isAdminOrAbove(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await db.employeeProfile.update({ where: { id: params.id }, data: { deletedAt: new Date(), status: "OFFBOARDED" } });
  return NextResponse.json({ success: true });
}
