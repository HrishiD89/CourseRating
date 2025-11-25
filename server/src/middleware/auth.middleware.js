import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    // 1. Check if token exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2. Extract token
    const token = authHeader.split("Bearer ")[1];

    // 3. Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Debug log
    console.log("authMiddleware decoded token:", decoded);

    // 4. Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Auth Middleware Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
