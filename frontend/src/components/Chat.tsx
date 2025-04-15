import React, { useEffect, useState } from "react";
import { socket } from "../socket";

interface IChat {
  username: string;
  message: string;
}

function Chat() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<IChat[]>([]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return; // 빈 메시지 방지
    socket.emit("sendMessage", {
      username: name,
      message: message,
    });
    setMessage("");
  };

  const fetchData = async () => {
    const response = await fetch("http://localhost:3500/api/chat");
    const json = await response.json();
    setMessages(json);
  };

  useEffect(() => {
    fetchData();
    const handleNewMessage = (data: IChat) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, []);

  return (
    <>
      <div className="chat">
        {messages.map((msg, i) => (
          <p key={i} style={{ marginBottom: " 6px" }}>
            <strong
              style={{
                borderRadius: "4px",
                backgroundColor: "#e2e2e2",
                color: "#191919",
                padding: "8px",
              }}
            >
              {msg.username}
            </strong>{" "}
            {msg.message}
          </p>
        ))}
      </div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <input
          type="text"
          value={message}
          placeholder="Write something..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <button>Send</button>
      </form>
    </>
  );
}

export default Chat;
