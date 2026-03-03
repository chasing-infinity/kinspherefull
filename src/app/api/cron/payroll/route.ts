import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyPayslips } from "@/lib/payroll/generate";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const result = await generateMonthlyPayslips(now.getMonth() + 1, now.getFullYear());
  return NextResponse.json({ success: true, ...result });
}
