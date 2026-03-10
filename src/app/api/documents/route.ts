export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, isAdminOrAbove } from "@/lib/auth/permissions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  if (!employeeId) return NextResponse.json({ error: "employeeId required" }, { status: 400 });

  const docs = await db.document.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (!isAdminOrAbove(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const employeeId = formData.get("employeeId") as string;
  const documentType = formData.get("documentType") as string;
  const name = formData.get("name") as string;

  if (!file || !employeeId || !documentType || !name)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const filePath = `${employeeId}/${Date.now()}-${name.replace(/\s+/g, "-")}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("employee-documents")
    .upload(filePath, file, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from("employee-documents")
    .getPublicUrl(filePath);

  const doc = await db.document.create({
    data: {
      employeeId,
      name,
      documentType,
      fileUrl: publicUrl,
      filePath,
      fileSize: file.size,
      uploadedBy: session.user.id,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;
  if (!isAdminOrAbove(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, filePath } = await req.json();
  if (!id || !filePath) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await supabase.storage.from("employee-documents").remove([filePath]);
  await db.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
