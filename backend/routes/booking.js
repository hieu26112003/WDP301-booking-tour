import express from "express";
import {
  createBooking,
  cancelBooking,
  updateBookingStatus,
  getAllBookings,
  getUserBookings,
} from "../Controllers/bookingController.js";
import {
  verifyAdmin,
  verifyStaff,
  verifyUser,
} from "../middleware/VerifyToken.js";

const router = express.Router();

router.post("/", verifyUser, createBooking);

router.put("/:id/cancel", verifyUser, cancelBooking);

router.put("/:id", verifyStaff, updateBookingStatus);

router.get("/all", verifyStaff, getAllBookings);

router.get("/", verifyUser, getUserBookings);

export default router;
