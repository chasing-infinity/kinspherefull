import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, isAdminOrAbove } from "@/lib/auth/permissions";
import { z } from "zod";

const Schema = z.object({
  leaveType: z.enum(["SICK", "CASUAL", "PAID", "UNPAID"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(5),
  taggedApprovers: z.array(z.string()).optional(),
});

function getQuarterlyAccrual(leaveType: string): number {
  const now = new Date();
  const month = now.getMonth();
  const quartersPassed = Math.floor(month / 3) + 1;
  if (leaveType === "SICK") return quartersPassed * 2;
  if (leaveType === "PAID") return quartersPassed * 2;
  return 0;
}

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  let where: any = {};
  if (!isAdminOrAbove(session.user.role)) {
    const profile = await db.employeeProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    where.employeeId = profile.id;
  }
  if (status) where.status = status;
  const leaves = await db.leaveRequest.findMany({
    where,
    include: {
      employee: { select: { firstName: true, lastName: true } },
      approvedBy: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(leaves);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const profile = await db.employeeProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { leaveType, startDate, endDate, reason, taggedApprovers } = parsed.data;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
  const year = new Date().getFullYear();

  const overlap = await db.leaveRequest.findFirst({
    where: {
      employeeId: profile.id,
      status: { in: ["APPROVED", "PENDING"] },
      OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
    },
  });
  if (overlap) return NextResponse.json({ error: "Dates overlap with an existing leave request" }, { status: 409 });

  if (leaveType === "SICK" || leaveType === "PAID") {
    const accrued = getQuarterlyAccrual(leaveType);
    let bal = await db.leaveBalance.findUnique({
      where: { employeeId_leaveType_year: { employeeId: profile.id, leaveType, year } },
    });
    if (!bal) {
      bal = await db.leaveBalance.create({
        data: { employeeId: profile.id, leaveType, year, total: accrued },
      });
    } else if (bal.total < accrued) {
      bal = await db.leaveBalance.update({
        where: { employeeId_leaveType_year: { employeeId: profile.id, leaveType, year } },
        data: { total: accrued },
      });
    }
    const avail = (bal?.total ?? 0) - (bal?.used ?? 0) - (bal?.pending ?? 0);
    if (days > avail) return NextResponse.json({ error: `Only ${avail} days available` }, { status: 400 });
    await db.leaveBalance.update({
      where: { employeeId_leaveType_year: { employeeId: profile.id, leaveType, year } },
      data: { pending: { increment: days } },
    });
  }

  const leave = await db.leaveRequest.create({
    data: {
      employeeId: profile.id,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason,
      taggedApprovers: taggedApprovers ?? [],
    },
  });

  return NextResponse.json(leave, { status: 201 });
}
