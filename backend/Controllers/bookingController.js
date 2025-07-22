import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import nodemailer from "nodemailer";
import { createNotification } from "./notificationController.js";

// Tạo booking
export const createBooking = async (req, res) => {
  try {
    const { userId, tourId, numberOfAdults, numberOfChildren, totalPrice } =
      req.body;

    if (!userId || !tourId || totalPrice < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu booking không hợp lệ" });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour không tồn tại" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    const booking = new Booking({
      userId,
      tourId,
      numberOfAdults,
      numberOfChildren,
      totalPrice,
      status: "pending",
    });

    const savedBooking = await booking.save();

    await createNotification(savedBooking._id, "booking", req.app.get("io"));
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Xác nhận yêu cầu đặt tour",
      html: `
        <h3>Xin chào ${user.fullname},</h3>
        <p>Cảm ơn bạn đã đặt tour <strong>${tour.title}</strong>!</p>
        <p><strong>Mã đặt chỗ:</strong> ${booking._id}</p>
        <p><strong>Số người lớn:</strong> ${numberOfAdults}</p>
        <p><strong>Số trẻ em:</strong> ${numberOfChildren}</p>
        <p><strong>Tổng tiền:</strong> ${totalPrice.toLocaleString(
          "vi-VN"
        )} đồng</p>
        <p>Thông tin thanh toán:</p>
        <ul>
          <li><strong>Chuyển khoản ngân hàng:</strong> Vietcombank, STK: 123456789, Chủ tài khoản: Công ty Du lịch XYZ</li>
          <li><strong>Tiền mặt:</strong> Tại văn phòng, địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
          <li><strong>Ví MoMo/ZaloPay:</strong> Số điện thoại: 0901234567</li>
        </ul>
        <p>Chúng tôi sẽ liên hệ để xác nhận và hướng dẫn thêm. Nếu có thắc mắc, vui lòng gọi <strong>1900 1234</strong>.</p>
        <p>Trân trọng,<br/>Đội ngũ du lịch</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Booking tạo thành công",
      data: savedBooking,
    });
  } catch (err) {
    console.error("Lỗi khi tạo booking:", err);
    res
      .status(500)
      .json({ success: false, message: `Lỗi khi tạo booking: ${err.message}` });
  }
};

// Hủy booking (khách hàng)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: id, userId }).populate(
      "tourId"
    );
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking không tồn tại hoặc không thuộc về bạn",
      });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Booking đã được hủy trước đó" });
    }

    // Validate departureDate
    if (!booking.tourId.departureDate) {
      return res.status(400).json({
        success: false,
        message: "Ngày khởi hành không được cung cấp",
      });
    }

    const departureDate = new Date(booking.tourId.departureDate);
    if (isNaN(departureDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Ngày khởi hành không hợp lệ" });
    }

    const now = new Date();
    const hoursUntilDeparture = (departureDate - now) / (1000 * 60 * 60);

    let canCancel = true;
    if (hoursUntilDeparture < 48) {
      canCancel = false;
    }

    if (!canCancel) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy tour do đã quá thời hạn theo chính sách: ${booking.tourId.cancellationPolicy}`,
      });
    }

    booking.status = "cancelled";
    const updatedBooking = await booking.save();
    await createNotification(
      updatedBooking._id,
      "cancellation",
      req.app.get("io")
    );
    const user = await User.findById(userId);
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Xác nhận hủy tour",
      html: `
        <h3>Xin chào ${user.fullname},</h3>
        <p>Yêu cầu hủy tour <strong>${
          booking.tourId.title
        }</strong> của bạn đã được ghi nhận.</p>
        <p><strong>Mã đặt chỗ:</strong> ${booking._id}</p>
        <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString(
          "vi-VN"
        )} đồng</p>
        <p>Chúng tôi sẽ liên hệ nếu cần thêm thông tin. Vui lòng gọi <strong>1900 1234</strong> nếu có thắc mắc.</p>
        <p>Trân trọng,<br/>Đội ngũ du lịch VIET TRAVEL</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Hủy tour thành công",
      data: updatedBooking,
    });
  } catch (err) {
    console.error("Lỗi khi hủy tour:", err);
    res
      .status(500)
      .json({ success: false, message: `Lỗi khi hủy tour: ${err.message}` });
  }
};

// Cập nhật trạng thái booking
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const booking = await Booking.findById(id).populate("tourId");
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking không tồn tại" });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    if (status === "confirmed") {
      await createNotification(
        updatedBooking._id,
        "confirmation",
        req.app.get("io")
      );
      const user = await User.findById(booking.userId);
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Xác nhận booking thành công",
        html: `
          <h3>Xin chào ${user.fullname},</h3>
          <p>Booking của bạn cho tour <strong>${
            booking.tourId.title
          }</strong> đã được xác nhận!</p>
          <p><strong>Mã đặt chỗ:</strong> ${booking._id}</p>
          <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString(
            "vi-VN"
          )} đồng</p>
          <p>Cảm ơn bạn đã chọn chúng tôi! Nếu có thắc mắc, vui lòng gọi <strong>1900 1234</strong>.</p>
          <p>Trân trọng,<br/>Đội ngũ du lịch VIET TRAVEL</p>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: updatedBooking,
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái:", err);
    res.status(500).json({
      success: false,
      message: `Lỗi khi cập nhật trạng thái: ${err.message}`,
    });
  }
};

// Lấy danh sách tất cả booking (nhân viên hoặc quản trị viên)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId tourId");
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách booking:", err);
    res.status(500).json({
      success: false,
      message: `Lỗi khi lấy danh sách booking: ${err.message}`,
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId }).populate("tourId");
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách booking:", err);
    res.status(500).json({
      success: false,
      message: `Lỗi khi lấy danh sách booking: ${err.message}`,
    });
  }
};
