import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const departments = await db.department.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ departments });
}
