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
      imageUrls,
    } = req.body;

    // Validate required fields
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

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    // Validate departureDate
    const parsedDate = new Date(departureDate);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid departure date format" });
    }

    // Ensure departureDate is not earlier than today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for comparison
    if (parsedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Departure date cannot be earlier than today",
      });
    }

    // Validate image requirements
    if (!req.file && (!imageUrls || !JSON.parse(imageUrls).length)) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const lastTour = await Tour.findOne().sort({ id: -1 });
    const newId = lastTour ? lastTour.id + 1 : 1;

    const images = [];
    if (req.file) {
      images.push(`/user_images/${path.basename(req.file.path)}`);
    }
    if (imageUrls) {
      try {
        const urls = JSON.parse(imageUrls);
        if (Array.isArray(urls)) {
          images.push(
            ...urls.filter((url) => typeof url === "string" && url.trim())
          );
        }
      } catch (err) {
        console.warn("Failed to parse imageUrls:", err);
      }
    }

    console.log("Created tour image paths:", images);

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
      departureDate: parsedDate,
      time,
      categoryId,
      images,
    });

    const savedTour = await newTour.save();
    res
      .status(201)
      .json({ success: true, message: "Tour created", data: savedTour });
  } catch (err) {
    console.error("Error in createTour:", err);
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
    console.log(
      "Fetched tours:",
      tours.map((t) => ({ id: t._id, images: t.images }))
    ); // Debugging log
    res.status(200).json({ success: true, data: tours });
  } catch (err) {
    console.error("Error in getAllTours:", err);
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
    console.error("Error in getSouthernTours:", err);
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
    console.error("Error in getNorthernTours:", err);
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
    console.error("Error in getComboTours:", err);
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

    console.log("Fetched tour:", { id: tour._id, images: tour.images }); // Debugging log
    res.status(200).json({ success: true, data: tour });
  } catch (err) {
    console.error("Error in getTourById:", err);
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
    console.error("Error in getTourByCategoryId:", err);
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
      existingImages,
      imageUrls,
    } = req.body;

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
      time,
      categoryId,
      featured,
    };

    if (departureDate) {
      const parsedDate = new Date(departureDate);
      if (isNaN(parsedDate.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid departure date format" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        return res.status(400).json({
          success: false,
          message: "Departure date cannot be earlier than today",
        });
      }
      updateData.departureDate = parsedDate;
    }

    let images = [];
    if (existingImages) {
      try {
        images = JSON.parse(existingImages);
      } catch (err) {
        console.warn("Failed to parse existingImages:", err);
      }
    }
    if (req.file) {
      images.unshift(`/user_images/${path.basename(req.file.path)}`);
    }
    if (imageUrls) {
      try {
        const urls = JSON.parse(imageUrls);
        if (Array.isArray(urls)) {
          images.push(
            ...urls.filter((url) => typeof url === "string" && url.trim())
          );
        }
      } catch (err) {
        console.warn("Failed to parse imageUrls:", err);
      }
    }

    if (images.length > 0) {
      updateData.images = images;
    } else if (!req.file && !existingImages && !imageUrls) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    console.log("Updated tour image paths:", updateData.images);

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
      !existingImages &&
      !imageUrls &&
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
    console.error("Error in updateTour:", err);
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

    if (deleted.images && deleted.images.length > 0) {
      for (const image of deleted.images) {
        if (image.startsWith("/user_images/")) {
          const imagePath = path.join(
            __dirname,
            "../../frontend/public/user_images",
            path.basename(image)
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

export const getToursByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const tours = await Tour.find({ categoryId: category._id }).populate(
      "categoryId",
      "name"
    );

    res.status(200).json({ success: true, data: tours });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tours by slug" });
  }
};
