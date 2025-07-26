import User from "../models/User.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Comment from "../models/Comment.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

// GET /api/admin/statistic
export const getAdminStatistics = async (req, res) => {
  try {
    // 1. Tổng số người dùng (user và staff)
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalStaff = await User.countDocuments({ role: "staff" });

    // 2. Tổng số tour
    const totalTours = await Tour.countDocuments();

    // 3. Tour được đặt nhiều nhất
    const topTour = await Booking.aggregate([
      {
        $group: {
          _id: "$tourId",
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "tours",
          localField: "_id",
          foreignField: "_id",
          as: "tourDetails",
        },
      },
      { $unwind: "$tourDetails" },
      {
        $project: {
          tourId: "$_id",
          title: "$tourDetails.title",
          bookingCount: 1,
        },
      },
    ]);

    // 4. Tổng số booking theo trạng thái
    const bookingStatus = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. Số lượng booking theo danh mục tour
    const bookingsByCategory = await Booking.aggregate([
      {
        $lookup: {
          from: "tours",
          localField: "tourId",
          foreignField: "_id",
          as: "tourDetails",
        },
      },
      { $unwind: "$tourDetails" },
      {
        $group: {
          _id: "$tourDetails.categoryId",
          bookingCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          categoryName: "$categoryDetails.name",
          bookingCount: 1,
        },
      },
    ]);

    // 6. Tổng số bình luận
    const totalComments = await Comment.countDocuments();

    // 7. Tổng doanh thu từ các booking đã hoàn thành và hủy tour
    const completedRevenue = await Booking.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $group: {
          _id: null,
          totalCompletedRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const cancellationRevenue = await Booking.aggregate([
      {
        $match: { revenue: { $gt: 0 } },
      },
      {
        $group: {
          _id: null,
          totalCancellationRevenue: { $sum: "$revenue" },
        },
      },
    ]);

    const totalRevenue =
      (completedRevenue.length > 0
        ? completedRevenue[0].totalCompletedRevenue
        : 0) +
      (cancellationRevenue.length > 0
        ? cancellationRevenue[0].totalCancellationRevenue
        : 0);

    // 8. Doanh thu theo ngày (completed bookings + cancellation revenue)
    const revenueByDay = await Booking.aggregate([
      {
        $match: {
          $or: [{ status: "completed" }, { revenue: { $gt: 0 } }],
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] },
                "$totalPrice",
                "$revenue",
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 9. Tổng doanh thu từ hủy tour (revenue field)
    const totalCancellationRevenue =
      cancellationRevenue.length > 0
        ? cancellationRevenue[0].totalCancellationRevenue
        : 0;

    // Trả về dữ liệu thống kê
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStaff,
        totalTours,
        totalRevenue,
        totalCancellationRevenue,
        topTour: topTour.length > 0 ? topTour[0] : null,
        bookingStatus,
        bookingsByCategory,
        totalComments,
        revenueByDay,
      },
    });
  } catch (err) {
    console.error("Error in getAdminStatistics:", err);
    res.status(500).json({
      success: false,
      message: `Failed to fetch statistics: ${err.message}`,
    });
  }
};
