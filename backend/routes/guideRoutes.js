import express from "express";
import upload from "../middleware/upload.js"; // Để xử lý ảnh
import { createGuide, getAllGuides, deleteGuide, updateGuide } from "../Controllers/guideControllers.js";

const router = express.Router();

// Route tạo guide (POST /api/guides)
router.post("/", upload.single("image"), createGuide);
router.get("/", getAllGuides);
router.delete("/:id", deleteGuide);
router.put("/:id", upload.single("image"), updateGuide);
export default router;
