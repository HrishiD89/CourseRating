import express from "express";
import {
  enrollInCourse,
  dropCourse,
  getEnrollmentStatus,
  getMyEnrollments,
} from "../controllers/enrollment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.post("/enroll/:courseId", authMiddleware, enrollInCourse);
router.delete("/drop/:courseId", authMiddleware, dropCourse);
router.get("/status/:courseId", authMiddleware, getEnrollmentStatus);
router.get("/my-courses", authMiddleware, getMyEnrollments);

export default router;
