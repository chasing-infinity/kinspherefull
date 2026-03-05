import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const employees = await db.employeeProfile.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      managerId: true,
      designation: true,
      user: { select: { role: true } },
      department: { select: { name: true } },
    },
  });

  // Build a map of id -> node
  const map = new Map<string, any>();
  for (const e of employees) {
    map.set(e.id, {
      ...e,
      name: `${e.firstName} ${e.lastName}`,
      children: [],
    });
  }

  // Attach each employee to their manager
  const roots: any[] = [];
  for (const e of employees) {
    const node = map.get(e.id)!;
    if (e.managerId && map.has(e.managerId)) {
      map.get(e.managerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return NextResponse.json(roots);
}
