import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../Controllers/categoryController.js";
import { verifyAdmin } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post("/", verifyAdmin, createCategory);
router.get("/", getAllCategories);
router.put("/:id", verifyAdmin, updateCategory);
router.delete("/:id", verifyAdmin, deleteCategory);
router.get("/:categoryId", getCategoryById);

export default router;
