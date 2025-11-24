import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    studentId: {
        type: String,
        require: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        require: true,
        trim: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        enum: ["student", "admin"],
        default: "student"
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema)

export default User