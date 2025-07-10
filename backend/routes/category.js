import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../Controllers/categoryController.js";
import { verifyAdmin } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post("/", verifyAdmin, createCategory);
router.get("/", verifyAdmin, getAllCategories);
router.put("/:id", verifyAdmin, updateCategory);
router.delete("/:id", verifyAdmin, deleteCategory);

export default router;
