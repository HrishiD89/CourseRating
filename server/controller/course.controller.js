import Course from "../models/Course.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    return res
      .status(200)
      .json({ message: "Courses fetched successfully", courses });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);
    return res
      .status(200)
      .json({ message: "Course fetched successfully", course });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const enrollCourse = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  const { courseId } = req.body;
  console.log(courseId);

  try {
    // Check if already enrolled - use schema field names: user and course
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "Course already enrolled" });
    }

    // Create enrollment - use schema field names: user and course
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
    });

    return res.status(200).json({
      message: "Course enrolled successfully",
      enrollment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const dropCourse = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  const { courseId } = req.body;
  console.log(courseId);

  try {
    // Check if already enrolled - use schema field names: user and course
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!existingEnrollment) {
      return res.status(400).json({ message: "Course not enrolled" });
    }

    // Create enrollment - use schema field names: user and course
    const enrollment = await Enrollment.deleteOne({
      user: userId,
      course: courseId,
    });

    return res.status(200).json({
      message: "Course dropped successfully",
      enrollment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const getEnrolledCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params; // Get from URL params instead of body

  try {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    return res.status(200).json({
      enrolled: !!enrollment, // Returns true if enrollment exists, false otherwise
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
