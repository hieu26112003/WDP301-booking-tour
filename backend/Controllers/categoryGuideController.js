import CategoryGuide from "../models/CategoryGuides.js";
import slugify from "slugify";

// [POST] /api/category-guides
// [POST] /api/category-guides
export const createCategoryGuide = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: "Name và Description là bắt buộc" });
    }

    const existing = await CategoryGuide.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category đã tồn tại" });
    }

    const newCategory = new CategoryGuide({
      name,
      description,
      isActive,
    });

    await newCategory.save();

    res.status(201).json({ success: true, message: "Tạo loại thành công", data: newCategory });
  } catch (err) {
    console.error("❌ Error creating category:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// [GET] /api/category-guides
export const getAllCategoryGuides = async (req, res) => {
  try {
    const categories = await CategoryGuide.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách loại cẩm nang", error: err.message });
  }
};

// [DELETE] /api/category-guides/:id
export const deleteCategoryGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CategoryGuide.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("❌ Delete category error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const updateCategoryGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: "Name và Description là bắt buộc" });
    }

    const updated = await CategoryGuide.findByIdAndUpdate(
      id,
      {
        name,
        description,
        isActive,
        slug: slugify(name, { lower: true, strict: true }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy category để cập nhật" });
    }

    res.status(200).json({ success: true, message: "Cập nhật thành công", data: updated });
  } catch (err) {
    console.error("❌ Error updating category:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
