import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, requireSession, isAdminOrAbove } from "@/lib/auth/permissions";
import { z } from "zod";
import bcrypt from "bcryptjs";

const CreateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["SUPER_ADMIN","ADMIN","EMPLOYEE"]).default("EMPLOYEE"),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string(),
  employmentType: z.enum(["FULL_TIME","PART_TIME","CONTRACT","INTERN"]).default("FULL_TIME"),
  salary: z.number().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page   = parseInt(searchParams.get("page") || "1");
  const limit  = parseInt(searchParams.get("limit") || "50");
  const where: any = { deletedAt: null, status: "ACTIVE" };
  if (search) where.OR = [
    { firstName: { contains: search, mode: "insensitive" } },
    { lastName:  { contains: search, mode: "insensitive" } },
    { user: { email: { contains: search, mode: "insensitive" } } },
  ];
  const [employees, total] = await Promise.all([
    db.employeeProfile.findMany({
      where,
      include: {
        user: { select: { email:true, role:true } },
        department: true,
        manager: { select: { id:true, firstName:true, lastName:true } }
      },
      skip: (page-1)*limit,
      take: limit,
      orderBy: { firstName: "asc" }
    }),
    db.employeeProfile.count({ where }),
  ]);
  const canSeeSalary = isAdminOrAbove(session.user.role);
  return NextResponse.json({
    employees: employees.map(e => ({ ...e, salary: canSeeSalary ? e.salary : undefined })),
    total
  });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const count = await db.employeeProfile.count();
  const employeeCode = `BF${String(count + 1).padStart(4, "0")}`;
  const hashedPw = await bcrypt.hash("Welcome@123", 10);
  const employee = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: d.email, password: hashedPw, role: d.role }
    });
    const profile = await tx.employeeProfile.create({
      data: {
        userId: user.id,
        employeeCode,
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : undefined,
        joiningDate: new Date(d.joiningDate),
        employmentType: d.employmentType,
        salary: d.salary,
        departmentId: d.departmentId || undefined,
        managerId: d.managerId || undefined,
        ...(d.designation ? { designation: d.designation } : {}),
      } as any,
    });
    const year = new Date().getFullYear();
    await tx.leaveBalance.createMany({ data: [
      { employeeId: profile.id, leaveType: "SICK",   year, total: 10 },
      { employeeId: profile.id, leaveType: "CASUAL", year, total: 12 },
      { employeeId: profile.id, leaveType: "PAID",   year, total: 15 },
      { employeeId: profile.id, leaveType: "UNPAID", year, total: 0  },
    ]});
    await tx.onboardingChecklist.create({ data: { employeeId: profile.id } });
    return profile;
  });
  return NextResponse.json(employee, { status: 201 });
}
