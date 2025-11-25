import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import ratingRoutes from "./routes/rating.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/auth", authRoutes);
app.use("/course", courseRoutes);
app.use("/enrollment", enrollmentRoutes);
app.use("/rating", ratingRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port http://localhost:${process.env.PORT}`)
    );
  } catch (error) {
    console.log("Failed to start server:", error);
  }
};

startServer();
