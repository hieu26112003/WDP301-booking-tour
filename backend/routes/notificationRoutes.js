import express from "express";
import {
  getAllNotifications,
  deleteNotification,
} from "../Controllers/notificationController.js";
import {
  verifyToken,
  verifyStaff,
  verifyUser,
} from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getAllNotifications);

router.delete("/:id", verifyToken, deleteNotification);

export default router;
