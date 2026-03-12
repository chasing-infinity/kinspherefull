import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/permissions";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const leave = await db.leaveRequest.findUnique({
    where: { id: params.id },
    include: { employee: { include: { user: true } } },
  });
  if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (leave.status !== "PENDING") return NextResponse.json({ error: "Not pending" }, { status: 400 });
  if (leave.employee.user.id === session.user.id) return NextResponse.json({ error: "Cannot approve own leave" }, { status: 403 });

  // Find current user's employee profile to check if they're tagged
  const currentProfile = await db.employeeProfile.findUnique({ where: { userId: session.user.id } });

  const hasTaggedApprovers = leave.taggedApprovers && leave.taggedApprovers.length > 0;
  const isTagged = currentProfile && leave.taggedApprovers.includes(currentProfile.id);
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  // Allow if: Super Admin always, or tagged approver if taggedApprovers exist
  if (!isSuperAdmin && !(hasTaggedApprovers && isTagged)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, note } = await req.json();
  const year = leave.startDate.getFullYear();

  await db.$transaction(async (tx) => {
    await tx.leaveRequest.update({
      where: { id: params.id },
      data: { status: action, note, approvedById: session.user.id, approvedAt: new Date() },
    });
    if (leave.leaveType !== "UNPAID") {
      if (action === "APPROVED") {
        await tx.leaveBalance.update({
          where: { employeeId_leaveType_year: { employeeId: leave.employeeId, leaveType: leave.leaveType, year } },
          data: { pending: { decrement: leave.days }, used: { increment: leave.days } },
        });
      } else {
        await tx.leaveBalance.update({
          where: { employeeId_leaveType_year: { employeeId: leave.employeeId, leaveType: leave.leaveType, year } },
          data: { pending: { decrement: leave.days } },
        });
      }
    }
  });

  return NextResponse.json({ success: true });
}
