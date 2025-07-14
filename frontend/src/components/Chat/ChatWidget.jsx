import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import "./ChatWidget.css";

// Khởi tạo socket kết nối đến server
const socket = io("http://localhost:8000");

const ChatWidget = () => {
    const { user } = useContext(AuthContext);
    const userId = user?._id;

    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!userId) return;

        socket.emit("join", userId);

        // socket.on("receiveMessage", (data) => {
        //     setChat((prev) => [...prev, { text: data.message, from: "staff" }]);
        // });

        socket.on("receiveMessage", (data) => {
            if (data.senderId !== userId) {
                setChat((prev) => [...prev, { text: data.message, from: "staff" }]);
            }
        });
        return () => {
            socket.off("receiveMessage");
        };
    }, [userId]);

    const fetchChatHistory = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/messages/user/${userId}`, {
                withCredentials: true,
            });

            const formatted = res.data.map((msg) => ({
                text: msg.message,
                from: String(msg.senderId) === String(userId) ? "user" : "staff",
            }));

            setChat(formatted);
        } catch (err) {
            console.error("Lỗi khi lấy lịch sử chat:", err);
        }
    };

    const toggleChat = () => {
        if (!isOpen && userId) {
            fetchChatHistory();
        }
        setIsOpen(!isOpen);
    };

    const handleSend = () => {
        if (!message.trim()) return;

        const msgData = {
            senderId: userId,
            receiverId: null, // gửi cho tất cả staff
            message,
        };

        socket.emit("sendMessage", msgData);
        setChat([...chat, { text: message, from: "user" }]);
        setMessage("");
    };

    useEffect(() => {
        const body = document.querySelector(".chat-body");
        if (body) {
            body.scrollTop = body.scrollHeight;
        }
    }, [chat]);

    return (
        <>
            {userId && (
                <div className="chat-widget-container">
                    <button className="chat-toggle-btn" onClick={toggleChat}>
                        💬
                    </button>

                    {isOpen && (
                        <div className={`chat-box ${isOpen ? "open" : ""}`}>
                            <div className="chat-header">
                                Hỗ trợ khách hàng
                                <button onClick={toggleChat}>X</button>
                            </div>
                            <div className="chat-body">
                                {chat.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message-wrapper ${msg.from === "user" ? "align-right" : "align-left"
                                            }`}
                                    >
                                        <div
                                            className={`chat-message ${msg.from === "user" ? "from-user" : "from-staff"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <button onClick={handleSend}>Gửi</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatWidget;
