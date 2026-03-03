import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const configs = await db.payrollConfig.findMany({ include: { employee: { select: { id:true, firstName:true, lastName:true, employeeCode:true, department: { select: { name:true } } } } }, orderBy: { updatedAt:"desc" } });
  const configuredIds = configs.map(c => c.employeeId);
  const unconfigured = await db.employeeProfile.findMany({ where: { id: { notIn: configuredIds }, status:"ACTIVE", deletedAt: null }, select: { id:true, firstName:true, lastName:true, employeeCode:true, department: { select: { name:true } } } });
  return NextResponse.json({ configured: configs, unconfigured });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const { employeeId, annualCTC, basicPercent, hraPercent, pfDeduction=0, professionalTax=0, incomeTax=0 } = body;
  if (!employeeId || !annualCTC || !basicPercent || !hraPercent) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  if (basicPercent + hraPercent > 100) return NextResponse.json({ error: "Basic + HRA cannot exceed 100%" }, { status: 400 });
  const config = await db.payrollConfig.upsert({
    where: { employeeId },
    update: { annualCTC, basicPercent, hraPercent, pfDeduction, professionalTax, incomeTax },
    create: { employeeId, annualCTC, basicPercent, hraPercent, pfDeduction, professionalTax, incomeTax },
  });
  await db.employeeProfile.update({ where: { id: employeeId }, data: { salary: annualCTC } });
  return NextResponse.json(config);
}
