import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const hash = await bcrypt.hash("Admin@123", 10);
  await db.user.updateMany({
    where: { email: { in: ["admin@bipolarfactory.com", "torsha@bipolarfactory.com"] } },
    data: { password: hash },
  });
  const hash2 = await bcrypt.hash("Welcome@123", 10);
  await db.user.updateMany({
    where: { email: "priya@bipolarfactory.com" },
    data: { password: hash2 },
  });
  return NextResponse.json({ ok: true });
}
