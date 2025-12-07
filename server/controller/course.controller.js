import Course from "../models/Course.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Rating from "../models/Rating.js";

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

    await Course.updateOne(
      {
        _id: courseId,
      },
      {
        $inc: { noOfEnrollment: 1 },
      }
    );

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

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        error: "Course not found!",
      });
    }

    // Check if user has rated this course BEFORE deleting
    const userRating = await Rating.findOne({
      user: userId,
      course: courseId,
    });

    // Delete enrollment
    await Enrollment.deleteOne({
      user: userId,
      course: courseId,
    });

    // Prepare update object
    const updateData = {
      $inc: { noOfEnrollment: -1 }, // Decrement enrollment count
    };

    // If user had rated, delete rating and update course rating stats
    if (userRating) {
      await Rating.deleteOne({
        user: userId,
        course: courseId,
      });

      const newRatingCount = course.noOfRating - 1;

      // Handle case when this was the only rating
      if (newRatingCount === 0) {
        updateData.$set = {
          noOfRating: 0,
          rating: 0,
        };
      } else {
        // Recalculate average rating
        const newAvgRating = parseFloat(
          (course.rating * course.noOfRating - userRating.rating) /
            newRatingCount
        ).toFixed(1);

        updateData.$set = {
          noOfRating: newRatingCount,
          rating: parseFloat(newAvgRating),
        };
      }
    }

    // Update course with all changes
    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res.status(200).json({
      message: "Course dropped successfully",
      rating: updatedCourse.rating,
      noOfRating: updatedCourse.noOfRating,
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

export const getUserRating = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  try {
    const userRating = await Rating.findOne({
      user: userId,
      course: courseId,
    });

    if (!userRating) {
      return res.status(200).json({
        rated: false,
        userRating: null,
      });
    }

    return res.status(200).json({
      rated: true,
      userRating: {
        rating: userRating.rating,
        review: userRating.review,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const rateCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;
  const { rating, review } = req.body;

  try {
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        error: "Rating should be between 1 and 5!",
      });
    }

    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(400).json({
        error: "User not found!",
      });
    }

    const userEnrolled = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!userEnrolled) {
      return res.status(400).json({
        error: "User have not enrolled to this course!",
      });
    }

    const exitingRating = await Rating.findOne({
      user: userId,
      course: courseId,
    });

    if (exitingRating) {
      return res.status(400).json({
        error: "User have already rated this course!",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        error: "Course not found!",
      });
    }

    const ratingResult = await Rating.create({
      user: userId,
      course: courseId,
      rating: ratingNum,
      review,
    });

    const newRatingCount = course.noOfRating + 1;
    const newAvgRating = parseFloat(
      (course.rating * course.noOfRating + ratingNum) / newRatingCount
    ).toFixed(1);

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $set: {
          noOfRating: newRatingCount,
          rating: newAvgRating,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Course rated successfully",
      rating: updatedCourse.rating,
      noOfRating: updatedCourse.noOfRating,
      userRating: {
        rating: ratingResult.rating,
        review: ratingResult.review,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
