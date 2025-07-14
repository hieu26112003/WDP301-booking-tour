import express from 'express';
import {
  getAllGuides,
  getGuideBySlug,
  createGuide,
  updateGuide,
  deleteGuide,
} from "../Controllers/guideControllers.js";

const router = express.Router();

// Lấy tất cả bài viết
router.get('/', getAllGuides);

// Lấy chi tiết bài viết theo slug
router.get('/:slug', getGuideBySlug);

// Tạo bài viết mới
router.post('/', createGuide);

// Cập nhật bài viết
router.put('/:id', updateGuide);

// Xóa bài viết
router.delete('/:id', deleteGuide);

export default router;
