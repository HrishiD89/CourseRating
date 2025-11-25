import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

/**
 * Add or update a rating for an enrolled course
 * POST /rating/rate/:courseId
 * Body: { rating: 1-5 }
 */
const rateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID format" });
    }

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find enrollment (user must be enrolled to rate)
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      status: { $in: ["enrolled", "completed"] }, // Can't rate if dropped
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must be enrolled in this course to rate it",
      });
    }

    // Update the personal rating in enrollment
    const oldRating = enrollment.personalRating;
    enrollment.personalRating = rating;
    await enrollment.save();

    // Recalculate course average rating
    await updateCourseAverageRating(courseId);

    res.status(200).json({
      message: oldRating
        ? "Rating updated successfully"
        : "Rating added successfully",
      enrollment,
      rating,
    });
  } catch (err) {
    console.error("Rate course error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get user's rating for a specific course
 * GET /rating/my-rating/:courseId
 */
const getMyRating = async (req, res) => {
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

    if (!enrollment || !enrollment.personalRating) {
      return res.status(200).json({
        rated: false,
        rating: null,
      });
    }

    res.status(200).json({
      rated: true,
      rating: enrollment.personalRating,
    });
  } catch (err) {
    console.error("Get rating error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Helper function to recalculate course average rating
 * This is called after any rating change
 */
const updateCourseAverageRating = async (courseId) => {
  try {
    // Get all enrollments with ratings for this course
    const enrollments = await Enrollment.find({
      course: courseId,
      personalRating: { $ne: null }, // Only count rated enrollments
    });

    if (enrollments.length === 0) {
      // No ratings yet
      await Course.findByIdAndUpdate(courseId, {
        avgRating: 0,
        totalRatings: 0,
      });
      return;
    }

    // Calculate average
    const totalRating = enrollments.reduce(
      (sum, enrollment) => sum + enrollment.personalRating,
      0
    );
    const avgRating = totalRating / enrollments.length;

    // Update course
    await Course.findByIdAndUpdate(courseId, {
      avgRating: avgRating,
      totalRatings: enrollments.length,
    });
  } catch (err) {
    console.error("Update average rating error:", err);
    throw err;
  }
};

export { rateCourse, getMyRating };
