import express from "express";
import {
  createTour,
  getAllTours,
  updateTour,
  deleteTour,
  getTourById,
  getSouthernTours,
  getNorthernTours,
  getComboTours,
} from "../Controllers/tourControllers.js";
import { verifyAdmin } from "../middleware/VerifyToken.js";
import upload from "../middleware/upload.js";

const router = express.Router();
router.get("/south", getSouthernTours);
router.get("/north", getNorthernTours);
router.get("/combo", getComboTours);

router.post("/", verifyAdmin, upload.single("image"), createTour);
router.get("/", getAllTours);
router.put("/:id", verifyAdmin, upload.single("image"), updateTour);
router.delete("/:id", verifyAdmin, deleteTour);
router.get("/:id", verifyAdmin, getTourById);
export default router;
