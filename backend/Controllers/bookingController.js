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
      revenue: 0,
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

    try {
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
            <li><strong>Chuyển khoản ngân hàng:</strong> Vietcombank, STK: 123456789, Chủ tài khoản: Công ty Du lịch Viet travel</li>
            <li><strong>Tiền mặt:</strong> Tại văn phòng, địa chỉ: Đại học FPT, Thạch Thất, Hà Nội</li>
            <li><strong>Ví MoMo/ZaloPay:</strong> Số điện thoại: 0901234567</li>
          </ul>
          <p>Chúng tôi sẽ liên hệ để xác nhận và hướng dẫn thêm. Nếu có thắc mắc, vui lòng gọi <strong>1900 1234</strong>.</p>
          <p>Trân trọng,<br/>Đội ngũ du lịch</p>
        `,
      });
    } catch (emailErr) {
      console.error("Lỗi khi gửi email trong createBooking:", emailErr);
    }

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

// Hủy booking (khách hàng hoặc nhân viên)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    const booking = await Booking.findById(id).populate("tourId");
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking không tồn tại" });
    }

    const isStaffOrAdmin = user.role === "staff" || user.role === "admin";
    const isOwner = booking.userId.toString() === userId;

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền hủy booking này",
      });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Booking đã được hủy trước đó" });
    }

    // Khách hàng chỉ được hủy ở trạng thái pending
    if (!isStaffOrAdmin && booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy booking ở trạng thái chờ xử lý",
      });
    }

    // Nhân viên/admin chỉ được hủy ở trạng thái deposit_confirmed
    if (isStaffOrAdmin && booking.status !== "deposit_confirmed") {
      return res.status(400).json({
        success: false,
        message:
          "Nhân viên chỉ có thể hủy booking ở trạng thái đã xác nhận đặt cọc",
      });
    }

    // Kiểm tra thời hạn hủy (48 giờ trước ngày khởi hành)
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

    if (hoursUntilDeparture < 48) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy tour do đã quá thời hạn 48 giờ trước ngày khởi hành: ${booking.tourId.cancellationPolicy}`,
      });
    }

    // Tính doanh thu nếu hủy ở trạng thái deposit_confirmed (chỉ áp dụng cho nhân viên/admin)
    let revenue = 0;
    if (isStaffOrAdmin && booking.status === "deposit_confirmed") {
      revenue = booking.totalPrice * 0.2; // 20% của totalPrice
    }

    booking.status = "cancelled";
    booking.revenue = revenue;
    const updatedBooking = await booking.save();

    await createNotification(
      updatedBooking._id,
      "cancellation",
      req.app.get("io")
    );

    const bookingUser = await User.findById(booking.userId);
    if (!bookingUser) {
      console.error("Không tìm thấy người dùng đặt tour:", booking.userId);
    }

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

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: bookingUser.email,
        subject: "Xác nhận hủy tour",
        html: `
          <h3>Xin chào ${bookingUser.fullname},</h3>
          <p>Yêu cầu hủy tour <strong>${
            booking.tourId.title
          }</strong> của bạn đã được ghi nhận.</p>
          <p><strong>Mã đặt chỗ:</strong> ${booking._id}</p>
          <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString(
            "vi-VN"
          )} đồng</p>
          ${
            revenue > 0
              ? `<p><strong>Doanh thu giữ lại (20%):</strong> ${revenue.toLocaleString(
                  "vi-VN"
                )} đồng</p>`
              : ""
          }
          <p>Chúng tôi sẽ liên hệ nếu cần thêm thông tin. Vui lòng gọi <strong>1900 1234</strong> nếu có thắc mắc.</p>
          <p>Trân trọng,<br/>Đội ngũ du lịch</p>
        `,
      });
    } catch (emailErr) {
      console.error("Lỗi khi gửi email trong cancelBooking:", emailErr);
    }

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
    const userId = req.user.id;

    if (
      !["pending", "deposit_confirmed", "completed", "cancelled"].includes(
        status
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    // Chỉ nhân viên hoặc admin được phép cập nhật trạng thái
    if (user.role !== "staff" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật trạng thái booking",
      });
    }

    const booking = await Booking.findById(id).populate("tourId");
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking không tồn tại" });
    }

    const bookingUser = await User.findById(booking.userId);
    if (!bookingUser) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng đặt tour không tồn tại" });
    }

    // Kiểm tra ngày khởi hành để đảm bảo trạng thái completed chỉ được đặt sau khi tour kết thúc
    if (status === "completed") {
      if (!booking.tourId.departureDate) {
        return res.status(400).json({
          success: false,
          message: "Ngày khởi hành không được cung cấp",
        });
      }

      const departureDate = new Date(booking.tourId.departureDate);
      const tourDuration = booking.tourId.duration || 1; // Giả sử duration tính bằng ngày
      const endDate = new Date(
        departureDate.getTime() + tourDuration * 24 * 60 * 60 * 1000
      );
      const now = new Date();

      if (now < endDate) {
        return res.status(400).json({
          success: false,
          message:
            "Không thể đặt trạng thái hoàn thành trước khi tour kết thúc",
        });
      }
    }

    // Tính doanh thu nếu chuyển sang trạng thái cancelled
    let revenue = booking.revenue || 0;
    if (status === "cancelled" && booking.status === "deposit_confirmed") {
      revenue = booking.totalPrice * 0.2; // 20% của totalPrice
    } else if (status !== "cancelled") {
      revenue = 0; // Reset revenue nếu không phải hủy
    }

    booking.status = status;
    booking.revenue = revenue;
    const updatedBooking = await booking.save();

    let notificationType;
    let emailSubject;
    let emailContent;

    if (status === "deposit_confirmed") {
      notificationType = "deposit_confirmation";
      emailSubject = "Xác nhận đặt cọc tour";
      emailContent = `
        <h3>Xin chào ${bookingUser.fullname},</h3>
        <p>Chúng tôi đã nhận được đặt cọc cho tour <strong>${
          booking.tourId.title
        }</strong>.</p>
        <p><strong>Mã đặt chỗ:</strong> ${booking._id}</p>
        <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString(
          "vi-VN"
        )} đồng</p>
        <p>Vui lòng hoàn tất thanh toán trước ngày khởi hành. Nếu có thắc mắc, vui lòng gọi <strong>1900 1234</strong>.</p>
        <p>Trân trọng,<br/>Đội ngũ du lịch</p>
      `;
    } else if (status === "completed") {
      notificationType = "tour_completed";
      emailSubject = "Cảm ơn bạn đã tham gia tour";
      emailContent = `
        <h3>Xin chào ${bookingUser.fullname},</h3>
        <p>Chúc mừng bạn đã hoàn thành tour <strong>${
          booking.tourId.title
        }</strong>!</p>
        <p><strong>Mã đặt chỗ:</strong> ${booking._id}</p>
        <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString(
          "vi-VN"
        )} đồng</p>
        <p>Cảm ơn bạn đã đồng hành cùng chúng tôi. Mong được gặp lại bạn trong các hành trình tiếp theo! Nếu có phản hồi, vui lòng liên hệ <strong>1900 1234</strong>.</p>
        <p>Trân trọng,<br/>Đội ngũ du lịch</p>
      `;
    } else if (status === "cancelled") {
      notificationType = "cancellation";
      emailSubject = "Xác nhận hủy tour";
      emailContent = `
        <h3>Xin chào ${bookingUser.fullname},</h3>
        <p>Yêu cầu hủy tour <strong>${
          booking.tourId.title
        }</strong> của bạn đã được ghi nhận.</p>
        <p><strong>Mã đặt chỗ:</strong> ${booking._id}</p>
        <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString(
          "vi-VN"
        )} đồng</p>
        ${
          revenue > 0
            ? `<p><strong>Doanh thu giữ lại (20%):</strong> ${revenue.toLocaleString(
                "vi-VN"
              )} đồng</p>`
            : ""
        }
        <p>Chúng tôi sẽ liên hệ nếu cần thêm thông tin. Vui lòng gọi <strong>1900 1234</strong> nếu có thắc mắc.</p>
        <p>Trân trọng,<br/>Đội ngũ du lịch</p>
      `;
    }

    if (notificationType) {
      await createNotification(
        updatedBooking._id,
        notificationType,
        req.app.get("io")
      );

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

      try {
        console.log(
          `Sending email to ${bookingUser.email} for status ${status}`
        );
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: bookingUser.email,
          subject: emailSubject,
          html: emailContent,
        });
      } catch (emailErr) {
        console.error("Lỗi khi gửi email trong updateBookingStatus:", emailErr);
      }
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

// Lấy tất cả bookings (Admin & Staff)
export const getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    const { startDate, endDate, status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (
      status &&
      ["pending", "deposit_confirmed", "completed", "cancelled"].includes(
        status
      )
    ) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let bookings;
    let totalBookings;

    if (user.role === "admin") {
      bookings = await Booking.find(query)
        .populate("userId tourId")
        .skip(skip)
        .limit(limitNum);
      totalBookings = await Booking.countDocuments(query);
    } else if (user.role === "staff") {
      const managedTours = await Tour.find({ staffId: userId }).select("_id");
      const tourIds = managedTours.map((tour) => tour._id);
      query.tourId = { $in: tourIds };
      bookings = await Booking.find(query)
        .populate("userId tourId")
        .skip(skip)
        .limit(limitNum);
      totalBookings = await Booking.countDocuments(query);
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total: totalBookings,
        page: pageNum,
        pages: Math.ceil(totalBookings / limitNum),
      },
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách booking:", err);
    res.status(500).json({
      success: false,
      message: `Lỗi khi lấy danh sách booking: ${err.message}`,
    });
  }
};

// Lấy bookings của người dùng
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

// Lấy tất cả bookings cho Admin
export const getAllBookingsforAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      userEmail,
      staffEmail,
      status,
    } = req.query;

    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    const allBookings = await Booking.find(query)
      .populate("userId", "email")
      .populate({
        path: "tourId",
        select: "title staffId",
        populate: {
          path: "staffId",
          select: "email",
        },
      })
      .sort({ createdAt: -1 });

    let filteredBookings = allBookings;

    if (userEmail) {
      const userKeyword = userEmail.toLowerCase();
      filteredBookings = filteredBookings.filter((b) =>
        b.userId?.email?.toLowerCase().includes(userKeyword)
      );
    }

    if (staffEmail) {
      const staffKeyword = staffEmail.toLowerCase();
      filteredBookings = filteredBookings.filter((b) =>
        b.tourId?.staffId?.email?.toLowerCase().includes(staffKeyword)
      );
    }

    const total = filteredBookings.length;
    const start = (page - 1) * limit;
    const paginated = filteredBookings.slice(start, start + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách booking admin:", err);
    res.status(500).json({
      success: false,
      message: `Lỗi server: ${err.message}`,
    });
  }
};
