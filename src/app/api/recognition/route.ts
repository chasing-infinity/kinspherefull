import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const recs = await db.recognition.findMany({
    where: { isPublic: true },
    include: { givenBy: { select: { profile: { select: { firstName:true, lastName:true } } } }, receivedBy: { select: { firstName:true, lastName:true } } },
    orderBy: { createdAt: "desc" }, take: 30,
  });
  return NextResponse.json(recs);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const { receivedById, message } = await req.json();
  if (!receivedById || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const self = await db.employeeProfile.findUnique({ where: { userId: session.user.id } });
  if (self?.id === receivedById) return NextResponse.json({ error: "Cannot recognise yourself" }, { status: 400 });
  const rec = await db.recognition.create({ data: { givenById: session.user.id, receivedById, message } });
  return NextResponse.json(rec, { status: 201 });
}
