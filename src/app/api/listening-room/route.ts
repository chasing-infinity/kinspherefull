import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/permissions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SYSTEM_PROMPT = `You are a warm, thoughtful presence inside The Listening Room — a private space within a company's HR system where employees can talk through work stress.

Your role is to listen carefully, acknowledge feelings, and help employees reflect and process difficult workdays. You are not a therapist and you do not diagnose or provide clinical advice.

Tone: calm, genuinely empathetic, non-judgmental, non-corporate, quietly curious.

How to respond:
- Always acknowledge the feeling first before asking anything
- Ask one gentle open question to help them go deeper
- Normalise difficult workdays
- Do not rush to fix, advise, or reframe
- Keep responses to 2-4 sentences

After 5+ exchanges you may occasionally say: "Sometimes talking things through with someone you trust at work can help lighten the load. If you ever feel comfortable doing that, HR is always available to listen." Only say this once.

Safety: If someone expresses serious distress or crisis, gently encourage them to speak to a trusted person or professional. Never diagnose or act as a therapist.`;

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const { data, error: dbError } = await supabase
    .from("listening_room_messages")
    .select("id, role, message, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(100);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const body = await req.json();
  const message: string = body.message ?? "";
  if (!message.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  await supabase.from("listening_room_messages").insert({
    user_id: session.user.id,
    role: "user",
    message: message.trim(),
  });

  const { data: history } = await supabase
    .from("listening_room_messages")
    .select("role, message")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const conversationHistory = ((history ?? []) as { role: string; message: string }[])
    .reverse()
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.message }],
    }));

  // Call Gemini API
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: conversationHistory,
        generationConfig: { maxOutputTokens: 400, temperature: 0.8 },
      }),
    }
  );

  const geminiData = await geminiRes.json();
  const reply: string =
    geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm here. Take your time.";

  await supabase.from("listening_room_messages").insert({
    user_id: session.user.id,
    role: "assistant",
    message: reply,
  });

  return NextResponse.json({ reply });
}
