"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const QUOTES = [
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "Not all those who wander are lost.", author: "J. R. R. Tolkien" },
  { text: "I dwell in possibility.", author: "Emily Dickinson" },
  { text: "What you seek is seeking you.", author: "Rumi" },
  { text: "There is nothing noble in being superior to your fellow man; true nobility is being superior to your former self.", author: "Ernest Hemingway" },
  { text: "And now that you don't have to be perfect, you can be good.", author: "John Steinbeck" },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It is our choices that show what we truly are.", author: "J. K. Rowling" },
  { text: "There is some good in this world, and it's worth fighting for.", author: "J. R. R. Tolkien" },
  { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
  { text: "Happiness can be found even in the darkest of times.", author: "J. K. Rowling" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African proverb" },
  { text: "A reader lives a thousand lives before he dies.", author: "George R. R. Martin" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "Where there is ruin, there is hope for a treasure.", author: "Rumi" },
  { text: "No one is useless in this world who lightens the burdens of another.", author: "Charles Dickens" },
  { text: "There are years that ask questions and years that answer.", author: "Zora Neale Hurston" },
  { text: "I am because we are.", author: "Ubuntu philosophy" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(QUOTES[0]);
  const router = useRouter();

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
      <div style={{ width: 440, background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: 40 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, background: "#4F6EF7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18 }}>⬡</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>KinSphere</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>Bipolar Factory</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 28 }}>Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@bipolarfactory.com"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          {error && (
            <div style={{ background: "#FEE2E2", color: "#B91C1C", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}
          <button type="submit" disabled={loading}
            style={{ width: "100%", background: loading ? "#9CA3AF" : "#4F6EF7", color: "white", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Quote */}
        <div style={{ marginTop: 28, padding: "16px 18px", background: "#F9FAFB", borderRadius: 12, borderLeft: "3px solid #4F6EF7" }}>
          <div style={{ fontSize: 13, color: "#374151", fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>"{quote.text}"</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>— {quote.author}</div>
        </div>
      </div>
    </div>
  );
}
