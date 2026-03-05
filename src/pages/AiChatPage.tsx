import { useState } from "react";

type Message = { role: "user" | "assistant"; text: string };

export function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "AI chat backend endpoint is not connected yet." }
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input },
      { role: "assistant", text: "AI chat backend endpoint is not connected yet." }
    ]);
    setInput("");
  };

  return (
    <div>
      <div className="topbar"><h1 style={{ margin: 0 }}>AI Chat</h1></div>
      <section className="card" style={{ minHeight: 520, display: "grid", gridTemplateRows: "1fr auto", gap: 12 }}>
        <div style={{ overflow: "auto", maxHeight: 420, display: "grid", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              justifySelf: m.role === "user" ? "end" : "start",
              maxWidth: "70%",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "10px 12px",
              background: m.role === "user" ? "var(--accent)" : "var(--bg-soft)",
              color: m.role === "user" ? "#03211e" : "var(--text)"
            }}>
              {m.text}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Ask about cluster, service, traceId..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="button" onClick={send}>Send</button>
        </div>
      </section>
    </div>
  );
}
