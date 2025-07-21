import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  promoteToStaff, // ⬅️ cần thêm
  demoteFromStaff,
} from "../Controllers/adminControllers.js";

import {
  verifyAdmin,
  verifyStaff,
  verifyToken,
} from "../middleware/VerifyToken.js";

const router = express.Router();

// Route chỉ admin được quyền
router.get("/users", verifyAdmin, getAllUsers);
router.post("/users", verifyAdmin, createUser);
router.put("/users/:id", verifyAdmin, updateUser);
router.delete("/users/:id", verifyAdmin, deleteUser);
router.patch("/users/:id/toggle-status", verifyAdmin, toggleUserStatus);
router.patch("/users/:id/promote", verifyAdmin, promoteToStaff);
router.patch("/users/:id/demote", verifyAdmin, demoteFromStaff);

// Cả admin và staff được quyền
router.get(
  "/users/:id",
  verifyToken,
  (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "staff") {
      next();
    } else {
      return res
        .status(403)
        .json({
          success: false,
          message: "Chỉ admin hoặc staff mới được phép!",
        });
    }
  },
  getUserById
);
export default router;
