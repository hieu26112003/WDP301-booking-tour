import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import path from "path";
import fs from "fs/promises";
import Category from "../models/Category.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tạo tour mới
export const createTour = async (req, res) => {
  try {
    const {
      title,
      summary,
      days,
      serviceStandards,
      priceChild,
      priceAdult,
      notes,
      cancellationPolicy,
      schedule,
      departureDate,
      time,
      categoryId,
    } = req.body;

    if (
      !title ||
      !summary ||
      !days ||
      !serviceStandards ||
      !priceChild ||
      !priceAdult ||
      !notes ||
      !cancellationPolicy ||
      !schedule ||
      !departureDate ||
      !time ||
      !categoryId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    const lastTour = await Tour.findOne().sort({ id: -1 });
    const newId = lastTour ? lastTour.id + 1 : 1;

    const imagePath = `/user_images/${path.basename(req.file.path)}`;

    const newTour = new Tour({
      id: newId,
      title,
      summary,
      days,
      serviceStandards,
      priceChild,
      priceAdult,
      notes,
      cancellationPolicy,
      schedule,
      departureDate,
      time,
      categoryId,
      image: imagePath,
    });

    const savedTour = await newTour.save();
    res
      .status(201)
      .json({ success: true, message: "Tour created", data: savedTour });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Tour title already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to create tour" });
  }
};

// Lấy tất cả tour
export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find().populate("categoryId", "name");
    res.status(200).json({ success: true, data: tours });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tours" });
  }
};

// Lấy tour Miền Nam
export const getSouthernTours = async (req, res) => {
  try {
    const southernTours = await Tour.find({
      categoryId: "686fae979bc976917041ce03",
    }).populate("categoryId", "name");

    res.status(200).json({ success: true, data: southernTours });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch southern tours" });
  }
};

// Lấy tour Miền Bắc
export const getNorthernTours = async (req, res) => {
  try {
    const northernTours = await Tour.find({
      categoryId: "686faea99bc976917041ce09",
    }).populate("categoryId", "name");

    res.status(200).json({ success: true, data: northernTours });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch northern tours" });
  }
};

// Lấy combo Tour
export const getComboTours = async (req, res) => {
  try {
    const comboTours = await Tour.find({
      categoryId: "687000428690d6e000e981f5",
    }).populate("categoryId", "name");

    res.status(200).json({ success: true, data: comboTours });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch combo tours" });
  }
};

// Lấy chi tiết tour
export const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tour ID" });
    }

    const tour = await Tour.findById(id).populate("categoryId", "name");
    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tour details" });
  }
};

// Lấy tour theo categoryId
export const getTourByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

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

    const query = { categoryId };
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tours = await Tour.find(query)
      .populate("categoryId", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Tour.countDocuments(query);

    if (tours.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
        message: search
          ? `No tours found for this category with search term "${search}"`
          : "No tours found for this category",
      });
    }

    res.status(200).json({
      success: true,
      data: tours,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch tours by category: ${err.message}`,
    });
  }
};

// Cập nhật tour
export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tour ID" });
    }

    const {
      title,
      summary,
      days,
      serviceStandards,
      priceChild,
      priceAdult,
      notes,
      cancellationPolicy,
      schedule,
      departureDate,
      time,
      categoryId,
      featured,
    } = req.body;

    if (
      !title &&
      !summary &&
      !days &&
      !serviceStandards &&
      !priceChild &&
      !priceAdult &&
      !notes &&
      !cancellationPolicy &&
      !schedule &&
      !departureDate &&
      !time &&
      !categoryId &&
      !req.file &&
      featured === undefined
    ) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    const updateData = {
      title,
      summary,
      days,
      serviceStandards,
      priceChild,
      priceAdult,
      notes,
      cancellationPolicy,
      schedule,
      departureDate,
      time,
      categoryId,
      featured,
      ...(req.file && {
        image: `/user_images/${path.basename(req.file.path)}`,
      }),
    };

    const updated = await Tour.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("categoryId", "name");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Updated successfully", data: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Tour title already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to update tour" });
  }
};

// Xóa tour
export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to delete tour with ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tour ID" });
    }

    const deleted = await Tour.findByIdAndDelete(id);
    if (!deleted) {
      console.log("Tour not found for ID:", id);
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    if (deleted.image) {
      const imagePath = path.join(
        __dirname,
        "../../frontend/public/user_images",
        path.basename(deleted.image)
      );
      try {
        await fs.access(imagePath);
        await fs.unlink(imagePath);
        console.log("Deleted image:", imagePath);
      } catch (fileErr) {
        console.warn(
          `Failed to delete image at ${imagePath}: ${fileErr.message}`
        );
      }
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("Error in deleteTour:", err);
    res.status(500).json({
      success: false,
      message: `Failed to delete tour: ${err.message}`,
    });
  }
};
