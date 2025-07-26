import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
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
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
    session: false,
  }),
  (req, res) => {
    const user = req.user; // lấy user do passport gán
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // chuyển hướng về frontend kèm token
    res.redirect(`http://localhost:3000/google-success?token=${token}`);
  }
);


export default router;
