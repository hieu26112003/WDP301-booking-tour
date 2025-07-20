import express from "express";
import {
  createComment,
  getCommentsByTourId,
  getPendingComments,
  approveComment,
  deleteComment,
  getAllComments,
} from "../Controllers/commentController.js";

const router = express.Router();

// User
router.post("/", createComment);
router.get("/tour/:tourId", getCommentsByTourId);

// Staff
router.get("/pending", getPendingComments);
router.get("/", getAllComments);
router.patch("/:id/approve", approveComment);
router.delete("/:id", deleteComment);

export default router;
