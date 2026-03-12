"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const STARTERS = [
  "I feel overwhelmed",
  "Work has been stressful lately",
  "I had a difficult conversation",
  "I can't switch off from work",
];

export default function ListeningRoomPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/listening-room")
      .then(r => r.json())
      .then(d => setMessages(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    const userMsg = { role: "user", message: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);
    const res = await fetch("/api/listening-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    if (data.reply) {
      setMessages(prev => [...prev, { role: "assistant", message: data.reply, created_at: new Date().toISOString() }]);
    }
    setSending(false);
  };

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 48px)", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>🎧 The Listening Room</h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6, lineHeight: 1.6 }}>
          A quiet space to pause and talk things through. Some workdays feel heavier than others. You can reflect here, unpack what's on your mind, or simply get something off your chest.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "8px 12px" }}>
          <span style={{ fontSize: 13 }}>🔒</span>
          <span style={{ fontSize: 12, color: "#15803D" }}>This space is private. Conversations in The Listening Room are only visible to you.</span>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: "20px 20px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#9CA3AF", paddingTop: 40 }}>Loading your conversations…</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9CA3AF", paddingTop: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14, color: "#6B7280" }}>This is your space. Start whenever you're ready.</div>
          </div>
        ) : messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "#4F6EF7" : "#F9FAFB",
              color: m.role === "user" ? "#fff" : "#1F2937",
              fontSize: 14, lineHeight: 1.6,
              border: m.role === "assistant" ? "1px solid #F3F4F6" : "none",
            }}>
              {m.message}
            </div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4, paddingLeft: 4, paddingRight: 4 }}>{fmt(m.created_at)}</div>
          </div>
        ))}
        {sending && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", fontSize: 14, color: "#9CA3AF" }}>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starters */}
      {messages.length === 0 && !loading && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 20, padding: "7px 14px", fontSize: 12, color: "#4B5563", cursor: "pointer", fontWeight: 500 }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Type how you're feeling…"
          disabled={sending}
          style={{ flex: 1, padding: "11px 16px", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 14, outline: "none", background: "#fff", color: "#111827" }}
        />
        <button onClick={() => send(input)} disabled={sending || !input.trim()}
          style={{ background: sending || !input.trim() ? "#9CA3AF" : "#4F6EF7", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 13, fontWeight: 600, cursor: sending || !input.trim() ? "not-allowed" : "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );
}
