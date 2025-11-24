import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);

const startServer = async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT, () => console.log(`Server running on port http://localhost:${process.env.PORT}`));
    } catch (error) {
        console.log("Failed to start server:", error);
    }
};

startServer();