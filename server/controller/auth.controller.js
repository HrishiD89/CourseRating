import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const userLogin =  async(req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET
    );
    res.status(200).json({
      message: "User login successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existinguser = await User.findOne({ email });
    if (existinguser) {
      return res.status(404).json({ error: "User already exist" });
    }

    const user = new User({
      name,
      email,
      password,
    });
    await user.save();

    const token = jwt.sign({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }, process.env.JWT_SECRET);

    res.status(200).json({
      message: "User register successfully",token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
