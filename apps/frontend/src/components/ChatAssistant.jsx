import { useState } from "react";
import { apiUrl } from "../lib/api.js";

export default function ChatAssistant({ onResult }) {
  const [message, setMessage] = useState("");
  const [log, setLog] = useState([]);

  const send = async () => {
    if (!message.trim()) {
      return;
    }

    const response = await fetch(apiUrl("/api/assistant"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    setLog((prev) => [
      { role: "user", text: message },
      { role: "assistant", text: data.answer || "Filters updated." }
    ]);
    setMessage("");
    onResult(data);
  };

  return (
    <div className="assistant">
      <h3>Assistant</h3>
      <div className="assistant-log">
        {log.map((entry, index) => (
          <p key={index} className={entry.role === "user" ? "user" : "ai"}>
            {entry.text}
          </p>
        ))}
      </div>
      <div className="assistant-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about roles, skills, or how to use the product"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
