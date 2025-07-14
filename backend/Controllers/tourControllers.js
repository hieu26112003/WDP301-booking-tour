import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import path from "path";

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

    // Kiểm tra categoryId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    // Kiểm tra ảnh
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    // Tạo ID tăng tự động
    const lastTour = await Tour.findOne().sort({ id: -1 });
    const newId = lastTour ? lastTour.id + 1 : 1;

    // Lưu đường dẫn ảnh tương đối
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

    // Kiểm tra dữ liệu
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

    // Kiểm tra categoryId hợp lệ
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
      }), // Cập nhật ảnh nếu có
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tour ID" });
    }

    const deleted = await Tour.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    if (deleted.image) {
      const imagePath = path.join(
        __dirname,
        "../../frontend/public",
        deleted.image
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete tour" });
  }
};
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
