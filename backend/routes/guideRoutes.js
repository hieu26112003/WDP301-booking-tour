import express from "express";
import upload from "../middleware/upload.js"; // Để xử lý ảnh
import { createGuide, getAllGuides, deleteGuide, updateGuide, getAllCategoryGuides, getGuideById } from "../Controllers/guideControllers.js";

const router = express.Router();

// Route tạo guide (POST /api/guides)
router.post("/", upload.single("image"), createGuide);
router.get("/", getAllGuides);
router.get("/categories", getAllCategoryGuides); // Đưa lên trên
router.get("/:id", getGuideById);
router.delete("/:id", deleteGuide);
router.put("/:id", upload.single("image"), updateGuide);
export default router;
