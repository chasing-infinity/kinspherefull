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
    include: {
      user: { select: { email: true, role: true } },
      department: true,
      manager: { select: { id: true, firstName: true, lastName: true } },
      reports: { select: { id: true, firstName: true, lastName: true } },
      leaveBalances: true,
      assets: true,
      onboardingChecklist: true,
    },
  });
  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...emp, salary: isAdminOrAbove(session.user.role) ? emp.salary : undefined });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Only Super Admins can edit employees" }, { status: 403 });

  const { role, firstName, lastName, phone, dateOfBirth, designation, departmentId, managerId, employmentType, salary } = await req.json();

  const emp = await db.employeeProfile.findFirst({ where: { id: params.id, deletedAt: null }, include: { user: true } });
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  await db.$transaction([
    db.employeeProfile.update({
      where: { id: params.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        designation: designation || undefined,
        departmentId: departmentId || undefined,
        managerId: managerId || null,
        employmentType: employmentType || undefined,
        salary: salary ? Number(salary) : undefined,
      },
    }),
    db.user.update({
      where: { id: emp.userId },
      data: { role: role || undefined },
    }),
  ]);

  const updated = await db.employeeProfile.findFirst({
    where: { id: params.id },
    include: {
      user: { select: { email: true, role: true } },
      department: true,
      manager: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Only Super Admins can offboard employees" }, { status: 403 });

  const emp = await db.employeeProfile.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { user: true },
  });
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  if (emp.userId === session.user.id) return NextResponse.json({ error: "You cannot offboard yourself" }, { status: 400 });

  await db.$transaction([
    db.employeeProfile.update({
      where: { id: params.id },
      data: { status: "OFFBOARDED", deletedAt: new Date() },
    }),
    db.user.update({
      where: { id: emp.userId },
      data: { role: "EMPLOYEE", password: "DEACTIVATED" },
    }),
    db.leaveRequest.updateMany({
      where: { employeeId: params.id, status: "PENDING" },
      data: { status: "CANCELLED" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
