import express from "express";
import {
  createCategoryGuide,
  getAllCategoryGuides,
  deleteCategoryGuide,
   updateCategoryGuide,
   getCategoryBySlug,
} from "../Controllers/categoryGuideController.js";

const router = express.Router();

router.post("/", createCategoryGuide);
router.get("/", getAllCategoryGuides);
router.delete("/:id", deleteCategoryGuide);
router.put("/:id", updateCategoryGuide);
router.get("/categoriesguide/:slug", getCategoryBySlug);
export default router;
