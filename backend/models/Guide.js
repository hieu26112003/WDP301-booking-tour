import mongoose from 'mongoose';

const GuideSchema = new mongoose.Schema(
  {
   title: {
  type: String,
  required: true,
  
},
    image: {
      type: String, // URL ảnh đại diện
      required: true,
    },
    content: {
      type: String, // HTML từ ReactQuill
      required: true,
    },
  },
  { timestamps: true } // Thêm createdAt và updatedAt
);
export default mongoose.model('Guide', GuideSchema);
