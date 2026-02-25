import express from "express";
import cors from "cors";
import examRoutes from "./routes/exam.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/exams", examRoutes);
app.use("/api/auth", authRoutes);

export default app;