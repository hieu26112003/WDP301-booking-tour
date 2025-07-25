import Guide from '../models/Guide.js';
import CategoryGuide from '../models/CategoryGuides.js';
import mongoose from "mongoose";
import path from "path";
import slugify from "slugify";


const VALID_CATEGORIES = ["kinh-nghiem", "am-thuc", "review", "xu-huong"];

// [GET] /api/guides - Lấy tất cả bài viết
export const createGuide = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!title || !category || !content || !content.trim() || content === "<p><br></p>") {
  const errors = {};
  if (!title) errors.title = "Tiêu đề không được để trống";
  if (!category) errors.category = "Danh mục không được để trống";
  if (!content || !content.trim() || content === "<p><br></p>") {
    errors.content = "Nội dung không được để trống";
  }

  return res.status(400).json({ success: false, errors });
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
    const { category } = req.query; // Lấy category từ query param
    let filter = {};

    if (category) {
      // Tìm category theo slug
      const catDoc = await CategoryGuide.findOne({ slug: category });
      if (catDoc) {
        filter.category = catDoc._id; // Lọc guide theo categoryId
      } else {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại cẩm nang!',
        });
      }
    }

    const guides = await Guide.find(filter)
      .populate('category', 'name slug') // chỉ lấy name và slug
      .sort({ createdAt: -1 });

    if (!guides || guides.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không có bài viết nào!',
      });
    }

    res.status(200).json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách Guides:', err);
    res.status(500).json({
      success: false,
      message: 'Lấy danh sách bài viết thất bại',
      error: err.message,
    });
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

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid guide ID" });
    }

    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const guide = await Guide.findById(id);
    if (!guide) {
      return res
        .status(404)
        .json({ success: false, message: "Guide not found" });
    }

    // Cập nhật các trường cơ bản
    guide.title = title;
    guide.content = content;
    guide.category = category;

    // Nếu có ảnh mới, xóa ảnh cũ và cập nhật ảnh mới
    if (req.file) {
      // Xóa ảnh cũ
      if (guide.image) {
        const oldRelativePath = guide.image.startsWith("/")
          ? guide.image.slice(1)
          : guide.image;
        const oldImagePath = path.join(process.cwd(), "frontend", "public", oldRelativePath);

        try {
          if (fs.existsSync(oldImagePath)) {
            await fs.promises.unlink(oldImagePath);
            console.log(`✅ Đã xóa ảnh cũ: ${oldImagePath}`);
          }
        } catch (err) {
          console.warn(`⚠ Lỗi khi xóa ảnh cũ: ${err.message}`);
        }
      }

      // Gán ảnh mới
      guide.image = `/user_image/${path.basename(req.file.path)}`;
    }

    const updatedGuide = await guide.save();

    res.status(200).json({
      success: true,
      message: "Guide updated successfully",
      data: updatedGuide,
    });
  } catch (err) {
    console.error("❌ Update guide error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update guide",
    });
  }
};

export const getAllCategoryGuides = async (req, res) => {
  try {
    const categories = await CategoryGuide.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lấy danh sách loại cẩm nang thất bại",
      error: err.message,
    });
  }
};

export const getGuideById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid guide ID" });
    }

    const guide = await Guide.findById(id).populate("category", "name");
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" });
    }

    res.status(200).json({ success: true, data: guide });
  } catch (err) {
    console.error("Error in getGuideById:", err);
    res.status(500).json({ success: false, message: "Failed to fetch guide details" });
  }
};

