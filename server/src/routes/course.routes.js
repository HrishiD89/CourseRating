import express from "express";
import { getAllCourses, getCourseById, searchCourse } from "../controllers/course.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/all", authMiddleware, getAllCourses);
router.get("/search/:title", authMiddleware, searchCourse);
router.get("/:id", authMiddleware, getCourseById);

export default router;