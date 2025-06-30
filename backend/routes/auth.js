import express from "express";
import {
  login,
  register,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.put("/:id/change-password", changePassword);
export default router;
