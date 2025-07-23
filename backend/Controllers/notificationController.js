import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createNotification = async (bookingId, type, io) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("userId", "username")
      .populate("tourId", "title");
    if (!booking) {
      console.error("Booking không tồn tại:", bookingId);
      return;
    }

    const userMessage =
      type === "booking"
        ? `Bạn đã đặt tour ${booking.tourId.title} thành công`
        : type === "cancellation"
        ? `Bạn đã hủy tour ${booking.tourId.title}`
        : `Booking của bạn cho tour ${booking.tourId.title} đã được xác nhận`;
    const userNotification = new Notification({
      userId: booking.userId._id,
      tourId: booking.tourId._id,
      bookingId: booking._id,
      type,
      message: userMessage,
      recipientId: booking.userId._id,
    });
    await userNotification.save();

    const staffMessage =
      type === "booking"
        ? `Người dùng ${booking.userId.username} đã đặt tour ${booking.tourId.title}`
        : type === "cancellation"
        ? `Người dùng ${booking.userId.username} đã hủy tour ${booking.tourId.title}`
        : `Người dùng ${booking.userId.username} xác nhận booking cho tour ${booking.tourId.title}`;
    const staffUsers = await User.find({ role: "staff" });
    const staffNotifications = staffUsers.map((staff) => ({
      userId: booking.userId._id,
      tourId: booking.tourId._id,
      bookingId: booking._id,
      type,
      message: staffMessage,
      recipientId: staff._id,
    }));
    await Notification.insertMany(staffNotifications);

    io.emit("newNotification", userNotification);
    staffNotifications.forEach((notif) => io.emit("newNotification", notif));
  } catch (error) {
    console.error(" Lỗi tạo thông báo:", error);
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate("userId", "username")
      .populate("tourId", "title")
      .sort({ createdAt: -1 });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có thông báo nào",
      });
    }

    res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    console.error(" Lỗi lấy danh sách thông báo:", err);
    res.status(500).json({
      success: false,
      message: "Lấy danh sách thông báo thất bại",
      error: err.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID thông báo không hợp lệ" });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      recipientId: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thông báo" });
    }

    res.json({ success: true, message: "Xóa thông báo thành công" });
  } catch (err) {
    console.error(" Lỗi xóa thông báo:", err);
    res.status(500).json({ success: false, message: "Xóa thông báo thất bại" });
  }
};
