// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding KinSphere...");

  // Departments
  const [engineering, design, product, ops] = await Promise.all([
    db.department.upsert({ where: { name: "Engineering" }, update: {}, create: { name: "Engineering" } }),
    db.department.upsert({ where: { name: "Design" }, update: {}, create: { name: "Design" } }),
    db.department.upsert({ where: { name: "Product" }, update: {}, create: { name: "Product" } }),
    db.department.upsert({ where: { name: "Operations" }, update: {}, create: { name: "Operations" } }),
  ]);

  const hash = async (p: string) => bcrypt.hash(p, 10);

  // Super Admin
  const superAdminUser = await db.user.upsert({
    where: { email: "admin@bipolarfactory.com" },
    update: {},
    create: {
      email: "admin@bipolarfactory.com",
      password: await hash("Admin@123"),
      role: "SUPER_ADMIN",
    },
  });

  const superAdminProfile = await db.employeeProfile.upsert({
    where: { userId: superAdminUser.id },
    update: {},
    create: {
      userId: superAdminUser.id,
      employeeCode: "BF0001",
      firstName: "Arjun",
      lastName: "Mehta",
      joiningDate: new Date("2022-01-01"),
      employmentType: "FULL_TIME",
      departmentId: ops.id,
      salary: 2500000,
    },
  });

  // Employee
  const empUser = await db.user.upsert({
    where: { email: "priya@bipolarfactory.com" },
    update: {},
    create: {
      email: "priya@bipolarfactory.com",
      password: await hash("Welcome@123"),
      role: "EMPLOYEE",
    },
  });

  const empProfile = await db.employeeProfile.upsert({
    where: { userId: empUser.id },
    update: {},
    create: {
      userId: empUser.id,
      employeeCode: "BF0002",
      firstName: "Priya",
      lastName: "Sharma",
      joiningDate: new Date("2023-06-15"),
      employmentType: "FULL_TIME",
      departmentId: engineering.id,
      managerId: superAdminProfile.id,
      salary: 1200000,
      dateOfBirth: new Date("1996-08-22"),
    },
  });

  // Leave balances for employee
  const year = new Date().getFullYear();
  for (const type of ["SICK", "CASUAL", "PAID", "UNPAID"] as const) {
    await db.leaveBalance.upsert({
      where: { employeeId_leaveType_year: { employeeId: empProfile.id, leaveType: type, year } },
      update: {},
      create: {
        employeeId: empProfile.id,
        leaveType: type,
        year,
        total: type === "SICK" ? 10 : type === "CASUAL" ? 12 : type === "PAID" ? 15 : 0,
      },
    });
  }

  // Onboarding checklist
  await db.onboardingChecklist.upsert({
    where: { employeeId: empProfile.id },
    update: {},
    create: { employeeId: empProfile.id },
  });

  // Holidays
  const holidays = [
    { name: "Republic Day", date: new Date(`${year}-01-26`) },
    { name: "Holi", date: new Date(`${year}-03-14`) },
    { name: "Good Friday", date: new Date(`${year}-04-18`) },
    { name: "Independence Day", date: new Date(`${year}-08-15`) },
    { name: "Gandhi Jayanti", date: new Date(`${year}-10-02`) },
    { name: "Diwali", date: new Date(`${year}-10-20`) },
    { name: "Christmas", date: new Date(`${year}-12-25`) },
  ];

  for (const h of holidays) {
    await db.holiday.upsert({
      where: { id: `holiday-${h.name.replace(/\s/g, "-").toLowerCase()}-${year}` },
      update: {},
      create: { ...h, id: `holiday-${h.name.replace(/\s/g, "-").toLowerCase()}-${year}` },
    });
  }

  console.log("✅ Seed complete!");
  console.log("\nAccounts:");
  console.log("  Super Admin: admin@bipolarfactory.com / Admin@123");
  console.log("  Employee:    priya@bipolarfactory.com / Welcome@123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
