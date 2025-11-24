import mongoose, { Schema } from "mongoose";
const EnrollmentSchema = new Schema({
    // References: Links this record to the User and the Course
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User Model
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // Reference to the Course Model
        required: true
    },
    // Enrollment Status and Progress
    status: {
        type: String,
        enum: ['applied', 'enrolled', 'dropped', 'completed'],
        default: 'enrolled' // Start as enrolled upon application approval
    },
    progress: {
        type: Number,
        default: 0, // Used for the progress bar in the Dashboard
        min: 0,
        max: 100
    },
    // Personal Rating
    personalRating: {
        type: Number, // 1 to 5 stars
        min: 1,
        max: 5,
        default: null // Null until the user rates it
    }
}, {
    timestamps: true
});

// Add a unique index to prevent a user from enrolling in the same course twice
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', EnrollmentSchema);