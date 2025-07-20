import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./StaffChat.css";

const socket = io("http://localhost:8000");

const StaffChat = ({ staffId }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");
    const chatBodyRef = useRef(null);

    const getAuthConfig = () => {
        const token = localStorage.getItem("accessToken");
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    useEffect(() => {
        if (!staffId) return;

        socket.emit("join", staffId);

        socket.on("receiveMessage", (data) => {
            if (selectedUser && String(data.senderId) === String(selectedUser._id)) {
                setChat((prev) => [...prev, { text: data.message, from: "user" }]);
            }
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [selectedUser, staffId]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const config = getAuthConfig();

                const res = await axios.get("http://localhost:8000/api/messages/users", config);
                const userIds = res.data;

                const userDetails = await Promise.all(
                    userIds.map((id) =>
                        axios.get(`http://localhost:8000/api/admin/users/${id}`, config).then((res) => res.data)
                    )
                );

                setUsers(userDetails);
            } catch (err) {
                console.error("❌ Lỗi khi lấy danh sách người dùng:", err);
            }
        };

        fetchUsers();
    }, []);

    const selectUser = async (user) => {
        if (!user?._id || !staffId) return;

        setSelectedUser(user);
        setChat([]);

        try {
            const config = getAuthConfig();

            const res = await axios.get(
                `http://localhost:8000/api/messages/${user._id}/${staffId}`,
                config
            );

            const formatted = res.data.map((msg) => ({
                text: msg.message,
                from: String(msg.senderId) === String(staffId) ? "staff" : "user",
            }));
            setChat(formatted);
        } catch (err) {
            console.error("❌ Lỗi khi lấy tin nhắn với user:", err);
        }
    };

    const handleSend = () => {
        if (!message.trim() || !selectedUser || !staffId) return;

        const msgData = {
            senderId: staffId,
            receiverId: selectedUser._id,
            message,
        };

        socket.emit("sendMessage", msgData);
        setChat((prev) => [...prev, { text: message, from: "staff" }]);
        setMessage("");
    };

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chat]);

    return (
        <div className="support-chat-container">
            <div className="support-user-list">
                <h4>Khách hàng</h4>
                {users
                    .filter((user) => String(user._id) !== String(staffId))
                    .map((user) => (
                        <div
                            key={user._id}
                            className={`support-user-item ${selectedUser?._id === user._id ? "active" : ""}`}
                            onClick={() => selectUser(user)}
                        >
                            {user.username}
                        </div>
                    ))}
            </div>

            <div className="support-chat-box">
                {selectedUser ? (
                    <>
                        <div className="support-chat-body" ref={chatBodyRef}>
                            <p style={{ fontStyle: "italic", fontSize: "13px", marginBottom: "10px" }}>
                                📨 Tổng số tin nhắn: {chat.length}
                            </p>
                            {chat.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`support-chat-message ${msg.from === "staff" ? "support-from-staff" : "support-from-user"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        <div className="support-chat-input">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button onClick={handleSend}>Gửi</button>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: "20px" }}>
                        <p>👉 Chọn một khách hàng để bắt đầu hỗ trợ.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffChat;
