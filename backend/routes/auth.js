import express from "express";
import {
  login,
  register,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
  getCurrentUser,
  updateUserProfile,
} from "../Controllers/authController.js";
import upload from "../middleware/upload.js";
import { verifyToken, verifyUser } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/me", verifyToken, getCurrentUser);
router.post("/reset-password", resetPassword);
router.put(
  "/:userId/profile",
  verifyUser,
  upload.single("avatar"),
  updateUserProfile
);
router.put("/:id/change-password", verifyUser, changePassword);

export default router;
