export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, isAdminOrAbove } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const assets = await db.asset.findMany({
    where: employeeId ? { employeeId } : {},
    include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (!isAdminOrAbove(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { employeeId, name, deviceType, model, serialNumber, assetTag } = await req.json();
  if (!employeeId || !name || !deviceType || !assetTag) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const existing = await db.asset.findUnique({ where: { assetTag } });
  if (existing) return NextResponse.json({ error: "Asset tag already exists" }, { status: 409 });

  const asset = await db.asset.create({
    data: {
      employeeId,
      name,
      deviceType,
      model: model || null,
      serialNumber: serialNumber || null,
      assetTag,
      status: "ASSIGNED",
      assignedAt: new Date(),
    },
  });
  return NextResponse.json(asset, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (!isAdminOrAbove(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const asset = await db.asset.update({
    where: { id },
    data: {
      status,
      returnedAt: status === "RETURNED" ? new Date() : null,
    },
  });
  return NextResponse.json(asset);
}
