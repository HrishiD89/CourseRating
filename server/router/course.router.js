import express from "express";
import { getAllCourses } from "../controller/course.controller.js";

const courseRouter = express.Router();

courseRouter.get("/all",getAllCourses);
// courseRouter.get("/:id",getCourseById);


export default courseRouter;