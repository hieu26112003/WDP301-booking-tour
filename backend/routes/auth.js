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
  resetPasswordConfirm,
} from "../Controllers/authController.js";
import upload from "../middleware/upload.js";
import {
  verifyUser,
  verifyAdmin,
  verifyToken,
} from "../middleware/VerifyToken.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/me", verifyToken, getCurrentUser);
router.post("/reset-password", resetPassword);
router.post("/reset-password/confirm", resetPasswordConfirm);

router.put(
  "/:userId/profile",
  verifyUser,
  upload.single("avatar"),
  updateUserProfile
);
router.put("/:id/change-password", verifyUser, changePassword);

export default router;
