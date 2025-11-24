import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Our API")
})

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
    } catch (error) {
        console.log("Failed to start server:", error);
    }
};

startServer();