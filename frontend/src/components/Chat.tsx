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
  const [room, setRoom] = useState("");

  const enterRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newRoom = event.currentTarget.dataset.room;
    if (newRoom === undefined) {
      return;
    }

    // Leave room
    if (room !== "") {
      leaveAllRoom();
    }

    setRoom(newRoom);
    setMessages([]);

    // Join new room
    socket.emit("join room", {
      username: name,
      room: newRoom,
    });

    fetchRoomData(newRoom);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return; // 빈 메시지 방지
    socket.emit("sendMessage", {
      username: name,
      message: message,
      room: room,
    });
    setMessage("");
  };

  const fetchData = async () => {
    const response = await fetch("http://localhost:3500/api/chat");
    const json = await response.json();
    setMessages(json);
  };

  const fetchRoomData = async (room: string) => {
    const response = await fetch(`http://localhost:3500/api/chat/${room}`);
    const json = await response.json();

    setMessages(json);
  };

  const leaveAllRoom = () => {
    socket.emit("leave room", {
      username: name,
      room: room,
    });
    fetchData();
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
    <main style={{ display: "grid", width: "400px", margin: "0 auto" }}>
      <div>
        <button onClick={leaveAllRoom}>Public</button>
        <button onClick={enterRoom} data-room="room1">
          Room1
        </button>
        <button onClick={enterRoom} data-room="room2">
          Room2
        </button>
        <button onClick={enterRoom} data-room="room3">
          Room3
        </button>
      </div>
      <h1>{room}</h1>
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
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "16px",
        }}
      >
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
    </main>
  );
}

export default Chat;
