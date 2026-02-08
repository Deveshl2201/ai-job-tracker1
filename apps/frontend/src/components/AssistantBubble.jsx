import { useMemo, useState } from "react";
import { apiUrl } from "../lib/api.js";

function buildSessionId() {
  const stored = localStorage.getItem("assistantSessionId");
  if (stored) {
    return stored;
  }
  const created = `session-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("assistantSessionId", created);
  return created;
}

export default function AssistantBubble({ onResult }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [log, setLog] = useState([]);
  const sessionId = useMemo(() => buildSessionId(), []);

  const send = async () => {
    if (!message.trim()) {
      return;
    }

    const payload = { message, sessionId };
    const response = await fetch(apiUrl("/api/assistant"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setLog((prev) => [
      ...prev,
      { role: "user", text: message },
      { role: "assistant", text: data.answer || "Updated." }
    ]);
    setMessage("");
    onResult(data);
  };

  return (
    <div className="assistant-bubble">
      <button className="assistant-toggle" onClick={() => setOpen((prev) => !prev)}>
        {open ? "Close" : "Assistant"}
      </button>
      {open && (
        <div className="assistant-panel">
          <h3>Job Assistant</h3>
          <div className="assistant-log">
            {log.length ? (
              log.map((entry, index) => (
                <p key={index} className={entry.role === "user" ? "user" : "ai"}>
                  {entry.text}
                </p>
              ))
            ) : (
              <p className="muted">Ask about roles, skills, or filters.</p>
            )}
          </div>
          <div className="assistant-input">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Try: Remote React roles this week"
            />
            <button onClick={send}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
