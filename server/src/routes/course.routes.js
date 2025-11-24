import express from "express";
import { getAllCourses, getCourseById, searchCourse } from "../controllers/course.controller.js";

const router = express.Router();

router.get("/all", getAllCourses);
router.get("/search/:title", searchCourse);
router.get("/:id", getCourseById);

export default router;