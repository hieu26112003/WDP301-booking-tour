import Category from "../models/Category.js";
import Tour from "../models/Tour.js";
import mongoose from "mongoose";

// Hàm loại bỏ dấu tiếng Việt và tạo slug
const slugify = (text) => {
  const diacriticsMap = {
    à: "a",
    á: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ẳ: "a",
    ẵ: "a",
    ặ: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ẩ: "a",
    ẫ: "a",
    ậ: "a",
    è: "e",
    é: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ể: "e",
    ễ: "e",
    ệ: "e",
    ì: "i",
    í: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ò: "o",
    ó: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ổ: "o",
    ỗ: "o",
    ộ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ở: "o",
    ỡ: "o",
    ợ: "o",
    ù: "u",
    ú: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ử: "u",
    ữ: "u",
    ự: "u",
    ỳ: "y",
    ý: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
    À: "A",
    Á: "A",
    Ả: "A",
    Ã: "A",
    Ạ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ẳ: "A",
    Ẵ: "A",
    Ặ: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ậ: "A",
    È: "E",
    É: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ẹ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ể: "E",
    Ễ: "E",
    Ệ: "E",
    Ì: "I",
    Í: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ị: "I",
    Ò: "O",
    Ó: "O",
    Ỏ: "O",
    Õ: "O",
    Ọ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ổ: "O",
    Ỗ: "O",
    Ộ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ở: "O",
    Ỡ: "O",
    Ợ: "O",
    Ù: "U",
    Ú: "U",
    Ủ: "U",
    Ũ: "U",
    Ụ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ử: "U",
    Ữ: "U",
    Ự: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Ỵ: "Y",
  };

  return text
    .split("")
    .map((char) => diacriticsMap[char] || char)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục và mô tả là bắt buộc",
      });
    }

    // Tạo slug từ tên
    let generatedSlug = slugify(name);

    // Kiểm tra định dạng slug
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(generatedSlug)) {
      return res.status(400).json({
        success: false,
        message:
          "Slug không hợp lệ (chỉ chứa chữ cái thường, số, và dấu gạch ngang)",
      });
    }

    // Kiểm tra trùng lặp slug
    const existingSlug = await Category.findOne({ slug: generatedSlug });
    if (existingSlug) {
      let suffix = 1;
      let newSlug = generatedSlug;
      while (await Category.findOne({ slug: newSlug })) {
        newSlug = `${generatedSlug}-${suffix}`;
        suffix++;
      }
      generatedSlug = newSlug;
    }

    const newCategory = new Category({
      name,
      description,
      slug: generatedSlug,
      isActive,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Danh mục đã được tạo",
      data: savedCategory,
    });
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern.name) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục đã tồn tại!",
        });
      }
      if (err.keyPattern.slug) {
        return res.status(400).json({
          success: false,
          message: "Slug đã tồn tại!",
        });
      }
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      message: "Không thể tạo danh mục: " + err.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Không thể lấy danh mục" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID danh mục không hợp lệ" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Không thể lấy danh mục: ${err.message}`,
    });
  }
};

export const getToursByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID danh mục không hợp lệ" });
    }

    const tours = await Tour.find({ category: categoryId });
    res.status(200).json({ success: true, data: tours });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Không thể lấy tour: ${err.message}`,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID danh mục không hợp lệ" });
    }

    const { name, description, isActive } = req.body;
    if (!name && !description && isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "Không có trường hợp lệ để cập nhật",
      });
    }

    // Tạo đối tượng cập nhật
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Tạo slug từ tên nếu name được cung cấp
    if (name) {
      let generatedSlug = slugify(name);
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(generatedSlug)) {
        return res.status(400).json({
          success: false,
          message:
            "Slug không hợp lệ (chỉ chứa chữ cái thường, số, và dấu gạch ngang)",
        });
      }

      // Kiểm tra trùng lặp slug, ngoại trừ danh mục hiện tại
      const existingSlug = await Category.findOne({
        slug: generatedSlug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        let suffix = 1;
        let newSlug = generatedSlug;
        while (await Category.findOne({ slug: newSlug, _id: { $ne: id } })) {
          newSlug = `${generatedSlug}-${suffix}`;
          suffix++;
        }
        generatedSlug = newSlug;
      }
      updateData.slug = generatedSlug;
    }

    // Kiểm tra trùng lặp tên, ngoại trừ danh mục hiện tại
    if (name) {
      const existingCategory = await Category.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục đã tồn tại!",
        });
      }
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: updated,
    });
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern.name) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục đã tồn tại!",
        });
      }
      if (err.keyPattern.slug) {
        return res.status(400).json({
          success: false,
          message: "Slug đã tồn tại!",
        });
      }
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật danh mục: " + err.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID danh mục không hợp lệ" });
    }

    // Check if category has associated tours
    const tours = await Tour.find({ category: id }); // Fixed to use 'category'
    if (tours.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa danh mục vì có các tour liên quan",
      });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại" });
    }

    res.status(200).json({ success: true, message: "Xóa danh mục thành công" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Không thể xóa danh mục: ${err.message}`,
    });
  }
};
