import express from "express";
import { getAdminStatistics } from "../Controllers/statisticsController.js";
import { verifyAdmin } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/", verifyAdmin, getAdminStatistics);

export default router;
