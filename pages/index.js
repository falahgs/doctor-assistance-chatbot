// pages/index.js
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (data.response) {
        // Add bot response to chat history
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: data.response },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: "There was an error processing your request." },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Failed to connect to the server." },
      ]);
    }

    setMessage("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Medical Assistance Chatbot</h1>
      <p>Ask me questions about medical and health-related topics only.</p>

      <div style={{ border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem", maxHeight: "300px", overflowY: "auto" }}>
        {chatHistory.map((chat, index) => (
          <div key={index} style={{ marginBottom: "0.5rem" }}>
            <strong>{chat.sender === "user" ? "You" : "Bot"}:</strong> {chat.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your medical question here..."
        style={{ width: "80%", padding: "0.5rem" }}
      />
      <button onClick={sendMessage} style={{ padding: "0.5rem", marginLeft: "0.5rem" }}>Send</button>
    </div>
  );
}
