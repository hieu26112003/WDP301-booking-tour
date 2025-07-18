import mongoose from 'mongoose';
import CategoryGuide from '../models/CategoryGuides.js';

const GuideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // Đường dẫn ảnh
      required: true,
    },
    content: {
      type: String, // HTML từ ReactQuill
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoryGuide', // Liên kết với bảng categoryguides
      required: true,
    },
  },
  { timestamps: true } // Thêm createdAt và updatedAt
);

export default mongoose.model('Guide', GuideSchema);
