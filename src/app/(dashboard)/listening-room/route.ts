import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/permissions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SYSTEM_PROMPT = `You are a warm, thoughtful presence inside The Listening Room — a private space within a company's HR system where employees can talk through work stress.

Your role is to listen carefully, acknowledge feelings, and help employees reflect and process difficult workdays. You are not a therapist and you do not diagnose or provide clinical advice.

Tone:
- Calm and unhurried
- Genuinely empathetic, not performative
- Non-judgmental and non-corporate
- Quietly curious — you ask one reflective question at a time
- Never overly motivational or solution-first

How to respond:
- Always acknowledge the feeling first before asking anything
- Ask one gentle, open question to help them go deeper
- Normalise difficult workdays — they are part of being human
- Do not rush to fix, advise, or reframe
- Keep responses concise — 2 to 4 sentences is usually enough

After longer conversations (5+ exchanges), you may occasionally and naturally say something like:
"Sometimes talking things through with someone you trust at work can help lighten the load. If you ever feel comfortable doing that, HR is always available to listen."
Only say this once and only when it feels natural.

Safety:
- If someone expresses serious distress, self-harm, or crisis, gently encourage them to speak to a trusted person or professional. Do not attempt to handle crisis situations yourself.
- Never diagnose mental health conditions
- Never act as a therapist`;

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const { data, error: dbError } = await supabase
    .from("listening_room_messages")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(100);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  // Save user message
  await supabase.from("listening_room_messages").insert({
    user_id: session.user.id,
    role: "user",
    message: message.trim(),
  });

  // Fetch recent history for context (last 20 messages)
  const { data: history } = await supabase
    .from("listening_room_messages")
    .select("role, message")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const conversationHistory = (history || []).reverse().map((m: any) => ({
    role: m.role,
    content: m.message,
  }));

  // Call Anthropic API
  const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: conversationHistory,
    }),
  });

  const aiData = await aiRes.json();
  const reply = aiData.content?.[0]?.text || "I'm here. Take your time.";

  // Save assistant reply
  await supabase.from("listening_room_messages").insert({
    user_id: session.user.id,
    role: "assistant",
    message: reply,
  });

  return NextResponse.json({ reply });
}
