import express from "express";
import {
  createTour,
  deleteTour,
  getAllTour,
  getFeaturedTour,
  getSingleTour,
  getTourBySearch,
  getTourCount,
  updateTour,
  getToursByCategory,
} from "../Controllers/tourControllers.js";

const router = express.Router();

router.post("/", createTour);

router.put("/:id", updateTour);

router.delete("/:id", deleteTour);

router.get("/:id", getSingleTour);

router.get("/", getAllTour);

router.get("/search/getTourBySearch", getTourBySearch);
router.get("/search/getFeaturedTour", getFeaturedTour);
router.get("/search/getTourCount", getTourCount);

router.get("/category/:categoryId", getToursByCategory);

export default router;
