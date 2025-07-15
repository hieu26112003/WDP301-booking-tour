import Guide from '../models/Guide.js';
import mongoose from "mongoose";
import path from "path";
import slugify from "slugify";


export const createGuide = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    const imagePath = `/user_images/${path.basename(req.file.path)}`;

    const newGuide = new Guide({
      title,
      content,
      image: imagePath,
    });

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
