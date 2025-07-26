import express from "express";
import {
  createComment,
  updateComment,
  getCommentsByTourId,
  
  deleteComment,
  getAllComments,
} from "../Controllers/commentController.js";
import {
  verifyToken,
  verifyStaff,
} from "../middleware/VerifyToken.js";

const router = express.Router();

// Public routes
router.get("/tour/:tourId", getCommentsByTourId);

// User routes (cần đăng nhập)
router.post("/", verifyToken, createComment);
router.put("/:id", verifyToken, updateComment);
router.delete("/:id", verifyToken, deleteComment);

// Staff/Admin routes

router.get("/", verifyToken, verifyStaff,  getAllComments);


export default router;