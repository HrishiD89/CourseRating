import express from "express";
import { rateCourse, getMyRating } from "../controllers/rating.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.post("/rate/:courseId", authMiddleware, rateCourse);
router.get("/my-rating/:courseId", authMiddleware, getMyRating);

export default router;
