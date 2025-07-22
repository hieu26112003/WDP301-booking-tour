import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
// import callRequestRoute from "./routes/callRequest.js";

import User from "./models/User.js";

import authRoute from "./routes/auth.js";
import adminRoute from "./routes/adminRoutes.js";
import tourRoute from "./routes/tour.js";
import categoryRoute from "./routes/category.js";
import messageRoute from "./routes/messageRoutes.js";
import Message from "./models/Message.js";
import guideRoutes from "./routes/guideRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import bookingRoute from "./routes/booking.js";
import commentRoute from "./routes/commentRoute.js";
import notificationRoute from "./routes/notificationRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

// Tạo server HTTP để dùng với Socket.IO
const server = http.createServer(app);

// Tạo Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend
    credentials: true,
  },
});

mongoose.set("strictQuery", false);
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
  }
};

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/tours", tourRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/guides", guideRoutes);
// app.use("/api/call-request", callRequestRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/messages", messageRoute);
app.use("/api/comment", commentRoute);
app.use("/api/notifications", notificationRoute);

app.use('/api/contact', contactRoutes);
app.use('/api/contact/feedbacks', contactRoutes);
app.use('/api/contact/callbacks', contactRoutes);
app.use("/api/callback/:id/call", contactRoutes);

// --- Socket.IO Logic ---
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`✅ ${userId} joined room`);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      const sender = await User.findById(senderId);
      if (!sender) return;

      let newMessage;

      if (sender.role === "user") {
        // Gửi tới tất cả nhân viên
        const staffList = await User.find({ role: "staff" });
        staffList.forEach((staff) => {
          io.to(staff._id.toString()).emit("receiveMessage", {
            senderId,
            message,
          });
        });

        // Chỉ lưu tin nhắn không có receiverId
        newMessage = new Message({ senderId, message });
      } else if (sender.role === "staff" && receiverId) {
        // Gửi lại cho user
        io.to(receiverId).emit("receiveMessage", {
          senderId,
          message,
        });

        // Lưu với receiverId
        newMessage = new Message({ senderId, receiverId, message });
      }

      if (newMessage) {
        await newMessage.save();
        console.log("💾 Tin nhắn đã được lưu vào DB");
      }
    } catch (err) {
      console.error("❌ Lỗi khi xử lý gửi tin nhắn:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// Lắng nghe server HTTP (không phải app.listen)
server.listen(port, () => {
  connect();
  console.log(`🚀 Server + Socket.IO running on port ${port}`);
});
