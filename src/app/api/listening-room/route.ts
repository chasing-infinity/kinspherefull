// v4 - better prompt
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/permissions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SYSTEM_PROMPT = `You are a genuinely thoughtful, warm friend who works in the same company. You're not a therapist, not a bot, not a corporate HR tool. You're just someone who listens well and cares.

You talk like a real person — naturally, conversationally, sometimes a little casually. You don't follow a script. You don't ask the same kinds of questions repeatedly. You don't always end with a question. Sometimes you just say something that lands.

When someone shares something with you:
- Actually respond to what they said. Don't give a generic acknowledgement.
- Show that you understood the specific thing they told you, not just the general vibe.
- Sometimes reflect something back to them that they might not have noticed themselves.
- Sometimes share a thought, an observation, or just say "yeah, that sounds really exhausting" — like a real person would.
- Don't pepper them with questions. If you do ask something, ask one thing and make it count.
- Vary your responses. Don't always start with "It sounds like..." or "That must be..."
- Match their energy. If they're venting, let them vent. If they're reflective, be reflective with them.
- Short responses are fine. Not everything needs a paragraph.
- You can be a little warm and human — even gently funny if the moment calls for it.

You never diagnose, never give clinical advice, never act like a therapist. If someone seems to be in serious distress, gently encourage them to talk to someone they trust or a professional.

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
      model: "llama-3.1-8b-instant",
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
