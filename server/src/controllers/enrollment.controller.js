import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

/**
 * Enroll a user in a course
 * POST /enrollment/enroll/:courseId
 */
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id; // From auth middleware

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID format" });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "Already enrolled in this course",
        enrollment: existingEnrollment,
      });
    }

    // Create new enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      status: "enrolled",
    });

    // Populate course details for response
    await enrollment.populate("course", "title courseCode instructor");

    res.status(201).json({
      message: "Successfully enrolled in course",
      enrollment,
    });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Drop a course (unenroll)
 * DELETE /enrollment/drop/:courseId
 */
const dropCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID format" });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Update status to 'dropped' instead of deleting
    enrollment.status = "dropped";
    await enrollment.save();

    res.status(200).json({
      message: "Successfully dropped the course",
      enrollment,
    });
  } catch (err) {
    console.error("Drop course error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get enrollment status for a specific course
 * GET /enrollment/status/:courseId
 */
const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID format" });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    }).populate("course", "title courseCode");

    if (!enrollment) {
      return res.status(200).json({
        enrolled: false,
        message: "Not enrolled in this course",
      });
    }

    res.status(200).json({
      enrolled: true,
      enrollment,
    });
  } catch (err) {
    console.error("Get enrollment status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all enrollments for the logged-in user
 * GET /enrollment/my-courses
 */
const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({
      user: userId,
      status: { $ne: "dropped" }, // Exclude dropped courses
    }).populate("course");

    res.status(200).json({
      message: "Enrollments fetched successfully",
      enrollments,
    });
  } catch (err) {
    console.error("Get enrollments error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { enrollInCourse, dropCourse, getEnrollmentStatus, getMyEnrollments };
