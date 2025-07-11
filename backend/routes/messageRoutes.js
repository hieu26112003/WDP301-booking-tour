import express from "express";
import mongoose from "mongoose";

import Message from "../models/Message.js";

const router = express.Router();

// ✅ Danh sách user từng nhắn
router.get("/users", async (req, res) => {
    try {
        const messages = await Message.find({});
        const uniqueUsers = [
            ...new Set(messages.map((msg) => msg.senderId.toString())),
        ];
        res.json(uniqueUsers);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
    }
});

// Lấy tất cả tin nhắn giữa 2 người
// ✅ Route cụ thể hơn lên trước
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy tin nhắn với user" });
    }
});

// ✅ Lấy tin nhắn giữa 2 người bất kỳ
// router.get("/:userId/:staffId", async (req, res) => {
//     const { userId, staffId } = req.params;

//     try {
//         const messages = await Message.find({
//             $or: [
//                 { senderId: userId, receiverId: staffId },
//                 { senderId: staffId, receiverId: userId },
//             ],
//         }).sort({ createdAt: 1 });

//         res.json(messages);
//     } catch (err) {
//         res.status(500).json({ message: "Lỗi khi lấy tin nhắn" });
//     }
// });

router.get("/:userId/:staffId", async (req, res) => {
    const { userId, staffId } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(staffId)
    ) {
        return res.status(400).json({ message: "ID không hợp lệ" });
    }

    try {
        // 👉 Chỉ lọc theo userId
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error("❌ Lỗi truy vấn tin nhắn:", err);
        res.status(500).json({ message: "Lỗi khi lấy tin nhắn" });
    }
});



export default router;
