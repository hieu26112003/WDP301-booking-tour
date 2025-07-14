import Category from "../models/Category.js";
import mongoose from "mongoose";

// Create
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Name and description are required" });
    }
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Category created",
      data: savedCategory,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Category name already exists" });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to create category" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// Update
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    const { name, description, isActive } = req.body;
    if (!name && !description && isActive === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    // Check for duplicate name
    if (name) {
      const existingCategory = await Category.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ success: false, message: "Category name already exists" });
      }
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: { name, description, isActive } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Updated successfully", data: updated });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update category" });
  }
};
// Delete
export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category" });
  }
};
