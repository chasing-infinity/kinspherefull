import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, isAdminOrAbove } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  if (isAdminOrAbove(session.user.role)) {
    const [onLeaveToday, pendingApprovals, totalEmployees, recentLeaves, onLeaveNow] = await Promise.all([
      db.leaveRequest.count({
        where: { status: "APPROVED", startDate: { lte: todayEnd }, endDate: { gte: todayStart } },
      }),
      db.leaveRequest.count({ where: { status: "PENDING" } }),
      db.employeeProfile.count({ where: { status: "ACTIVE", deletedAt: null } }),
      db.leaveRequest.findMany({
        where: { status: "PENDING" },
        include: { employee: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.leaveRequest.findMany({
        where: {
          status: "APPROVED",
          startDate: { lte: todayEnd },
          endDate: { gte: todayStart },
        },
        include: { employee: { select: { firstName: true, lastName: true } } },
        orderBy: { startDate: "asc" },
      }),
    ]);

    const employees = await db.employeeProfile.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { id: true, firstName: true, lastName: true, dateOfBirth: true, joiningDate: true },
    });

    const next30 = new Date(today); next30.setDate(today.getDate() + 30);
    const birthdays = employees.filter(e => {
      if (!e.dateOfBirth) return false;
      const d = new Date(today.getFullYear(), e.dateOfBirth.getMonth(), e.dateOfBirth.getDate());
      if (d < today) d.setFullYear(today.getFullYear() + 1);
      return d <= next30;
    }).slice(0, 5);

    const anniversaries = employees.filter(e => {
      const d = new Date(today.getFullYear(), e.joiningDate.getMonth(), e.joiningDate.getDate());
      if (d < today) d.setFullYear(today.getFullYear() + 1);
      return d <= next30;
    }).slice(0, 5);

    return NextResponse.json({
      type: "admin",
      stats: { onLeaveToday, pendingApprovals, totalEmployees },
      recentLeaves,
      onLeaveNow,
      birthdays,
      anniversaries,
    });
  }

  const profile = await db.employeeProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const year = today.getFullYear();
  const [leaveBalances, myRequests, upcomingHolidays, onLeaveNow] = await Promise.all([
    db.leaveBalance.findMany({ where: { employeeId: profile.id, year } }),
    db.leaveRequest.findMany({ where: { employeeId: profile.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.holiday.findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" }, take: 5 }),
    db.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        startDate: { lte: todayEnd },
        endDate: { gte: todayStart },
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return NextResponse.json({ type: "employee", leaveBalances, myRequests, upcomingHolidays, onLeaveNow });
}
