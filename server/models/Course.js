import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true },
    courseDescription: { type: String, required: true },
    rating: { type: Number, required: true },
    noOfRating: { type: Number, required: true },
    courseThumbnail: { type: String, required: true },
    coursePrice: { type: Number, required: true },
    courseLanguage: { type: String, required: true },
    author: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", courseSchema);
