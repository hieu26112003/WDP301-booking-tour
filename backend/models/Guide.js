import mongoose from 'mongoose';

const GuideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String, // HTML chuỗi đã render sẵn
      required: true,
    },
    image: {
      type: String, // URL ảnh đại diện
      required: true,
    },
    
  },
  { timestamps: true } // Tự động thêm createdAt, updatedAt
);

export default mongoose.model('Guide', GuideSchema);
