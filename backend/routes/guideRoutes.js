import express from "express";
import upload from "../middleware/upload.js"; // Để xử lý ảnh
import { createGuide, getAllGuides } from "../Controllers/guideControllers.js";

const router = express.Router();

// Route tạo guide (POST /api/guides)
router.post("/", upload.single("image"), createGuide);
router.get("/", getAllGuides);
export default router;
