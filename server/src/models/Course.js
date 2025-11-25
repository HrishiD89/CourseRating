import mongoose, { Schema } from "mongoose";

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  courseCode: {
    // e.g., CS 101
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: String, // Simpler for MVP, later reference the User model
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  // For Rating/Review Feature
  avgRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  // For Capacity/Application Feature
  maxCapacity: {
    type: Number,
    default: 40,
  },
  enrolledCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Course", CourseSchema);
