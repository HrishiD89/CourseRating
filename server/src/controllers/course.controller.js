import Course from "../model/Course.js";
import mongoose from "mongoose";

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
        if (!courses) {
            return res.status(404).json({ message: "Courses not found" })
        }
        res.status(200).json({ message: "Courses fetched successfully", courses })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

const getCourseById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Course ID format" });
        }
        const course = await Course.findById(req.params.id)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }
        res.status(200).json({ message: "Course fetched successfully", course })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

const searchCourse = async (req, res) => {
    try {
        const courses = await Course.find({ title: { $regex: req.params.title, $options: "i" } })
        if (!courses) {
            return res.status(404).json({ message: "Courses not found" })
        }
        res.status(200).json({ message: "Courses fetched successfully", courses })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

export { getAllCourses, getCourseById, searchCourse };