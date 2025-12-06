import express from "express";
import {
  getAllCourses,
  getCourseById,
  enrollCourse,
  dropCourse,
  getEnrolledCourse,
} from "../controller/course.controller.js";
import { authMiddleWare } from "../middlewares/authMiddleWare.js";

const courseRouter = express.Router();

courseRouter.get("/all", getAllCourses);
courseRouter.get("/:id", getCourseById);
courseRouter.post("/enroll", authMiddleWare, enrollCourse);
courseRouter.post("/drop", authMiddleWare, dropCourse);
courseRouter.get("/enrolled/:courseId", authMiddleWare, getEnrolledCourse);

export default courseRouter;
