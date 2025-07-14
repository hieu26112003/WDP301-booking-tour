import express from "express";
import {

    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    promoteToStaff,     // ⬅️ cần thêm
    demoteFromStaff
} from "../Controllers/adminControllers.js";

import { verifyAdmin } from "../middleware/VerifyToken.js";


const router = express.Router();

// Áp dụng verifyAdmin cho tất cả route dưới đây
router.use(verifyAdmin);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.patch("/users/:id/promote", promoteToStaff); // bỏ verifyAdmin nếu không cần
router.patch("/users/:id/demote", demoteFromStaff);

export default router;
