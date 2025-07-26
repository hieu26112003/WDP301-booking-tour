import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    numberOfAdults: {
      type: Number,
      required: true,
      min: [0, "Số người lớn không thể âm"],
    },
    numberOfChildren: {
      type: Number,
      required: true,
      min: [0, "Số trẻ em không thể âm"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Tổng giá không thể âm"],
    },
    status: {
      type: String,
      enum: ["pending", "deposit_confirmed", "completed", "cancelled"],
      default: "pending",
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, "Doanh thu không thể âm"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
