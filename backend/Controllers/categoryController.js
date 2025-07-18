// categoryController.js
import Category from "../models/Category.js";
import Tour from "../models/Tour.js"; // Assuming Tour model exists
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

// Get all categories
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

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch category: ${err.message}`,
    });
  }
};

// Get tours by category
export const getToursByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    const tours = await Tour.find({ category: categoryId });
    res.status(200).json({ success: true, data: tours });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch tours: ${err.message}`,
    });
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

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    // Check if category has associated tours
    const tours = await Tour.find({ categoryId: id }); // Updated to use categoryId
    if (tours.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category because it has associated tours",
      });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to delete category: ${err.message}`,
    });
  }
};
