import express from "express";
import cors from "cors";
import examRoutes from "./routes/exam.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Adjust this to your frontend URL
    credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/exams", examRoutes);
app.use("/api/auth", authRoutes);

export default app;