// v4 - better prompt
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/permissions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SYSTEM_PROMPT = `You are having a real, natural conversation with a colleague who is going through something difficult. 

STRICT RULES:
- NEVER say "I'm here to listen" or "What's on your mind" — ever. Not once.
- NEVER repeat yourself or ask the same question twice.
- ALWAYS respond directly and specifically to what the person just said.
- Read the entire conversation history before responding.

How to talk:
- Respond like a smart, caring friend would — directly, warmly, specifically.
- If they say their heart feels crushed, respond to THAT. Not generically.
- If they ask you a question, answer it thoughtfully like a real person would.
- Keep it conversational. Short is fine. You don't always need to ask a question.
- Never sound like a helpline or a bot.

You are not a therapist. If someone seems in serious crisis, gently suggest speaking to someone they trust.`;

After a long conversation (7+ messages), if it feels natural, you might mention that HR is always available if they want to talk to a real person — but only once, and only if it genuinely fits the moment.

Most importantly: make the person feel heard. Not processed. Heard.`;

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
    .limit(30);

  const conversationHistory = ((history ?? []) as { role: string; message: string }[])
    .reverse()
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.message,
    }));

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      temperature: 0.9,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory,
      ],
    }),
  });

  const groqData = await groqRes.json();
  if (!groqData.choices?.[0]?.message?.content) {
    console.error("Groq error:", JSON.stringify(groqData));
  }
  const reply: string = groqData.choices?.[0]?.message?.content ?? "I'm here. Take your time.";

  await supabase.from("listening_room_messages").insert({
    user_id: session.user.id,
    role: "assistant",
    message: reply,
  });

  return NextResponse.json({ reply });
}
