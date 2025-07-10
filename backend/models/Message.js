import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true } // tự động tạo createdAt, updatedAt
);

export default mongoose.model("Message", messageSchema);
