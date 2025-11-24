import { generateToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exitingUser = await User.findOne({ email });
        if (exitingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const studentId = "S" + Date.now();

        const newUser = await User.create({
            name,
            email,
            password, // Mongoose hook will hash this
            studentId
        });

        const token = generateToken({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                studentId: newUser.studentId
            },
            token
        });
    } catch (error) {
        console.log("Register Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Must select password explicitly since it's hidden by default
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Use the method we defined in the User model
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}