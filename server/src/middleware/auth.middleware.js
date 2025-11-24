import { verifyToken } from "../utils/jwt.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authMiddleware = (req, res, next) => {
    try {
        // 1. Check if token exists
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 2. Extract token from bearer token
        const token = authHeader.split("Bearer ")[1];

        // 3. Verify token
        const decoded = verifyToken(token);
        if(!decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // 4. Add user to req
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Auth Middleware Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};