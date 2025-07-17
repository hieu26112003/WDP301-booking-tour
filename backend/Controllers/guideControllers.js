import Guide from '../models/Guide.js';
import mongoose from "mongoose";
import path from "path";
import slugify from "slugify";


const VALID_CATEGORIES = ["kinh-nghiem", "am-thuc", "review", "xu-huong"];

// [GET] /api/guides - Lấy tất cả bài viết
export const createGuide = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Kiểm tra có ảnh không
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    // Lưu đường dẫn ảnh
    const imagePath = `/user_images/${path.basename(req.file.path)}`;

    // Tạo đối tượng Guide mới
    const newGuide = new Guide({
      title,
      content,
      category,
      image: imagePath,
    });

    // Lưu vào DB
    const savedGuide = await newGuide.save();

    res.status(201).json({
      success: true,
      message: "Guide created",
      data: savedGuide,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Guide title already exists" });
    }
    console.error("❌ Guide creation error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create guide" });
  }
};

export const getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: guides });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch guides" });
  }
};

export const deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid guide ID" });
    }

    // Xóa guide trong DB
    const deleted = await Guide.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found" });
    }

    // Xóa ảnh trong thư mục frontend/public/user_image
    if (deleted.image) {
      // Bỏ dấu "/" đầu nếu có
      const relativePath = deleted.image.startsWith("/")
        ? deleted.image.slice(1)
        : deleted.image;

      // Đường dẫn tuyệt đối
      const imagePath = path.join(process.cwd(), "frontend", "public", relativePath);

      try {
        if (fs.existsSync(imagePath)) {
          await fs.promises.unlink(imagePath);
          console.log(`✅ Đã xóa ảnh: ${imagePath}`);
        } else {
          console.warn(`⚠ Ảnh không tồn tại: ${imagePath}`);
        }
      } catch (err) {
        console.error("⚠ Lỗi khi xóa ảnh:", err.message);
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete guide:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete guide" });
  }
};


export const updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid guide ID" });
    }

    const { title, content, category } = req.body;

    // Kiểm tra dữ liệu
    if (!title && !content && !category && !req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    const updateData = {
      title,
      content,
      category,
      ...(req.file && {
        image: `/user_images/${path.basename(req.file.path)}`,
      }), // Cập nhật ảnh nếu có
    };

    const updated = await Guide.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found" });
    }

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updated,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Guide title already exists" });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to update guide" });
  }
};
