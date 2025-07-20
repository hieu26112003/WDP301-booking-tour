    import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,       // Bắt buộc phải có nội dung
      trim: true
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",          // Liên kết tới collection Tour
      required: true
    },
    approved: {
      type: Boolean,
      default: false        // Mặc định chưa duyệt
    }
  },
  { timestamps: true }      // Tự tạo createdAt và updatedAt
);

export default mongoose.model("Comment", CommentSchema);
