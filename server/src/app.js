import express from "express";
import cors from "cors";
import examRoutes from "./routes/exam.routes.js";
import authRoutes from "./routes/auth.routes.js";
import directoryRoutes from "./routes/directory.routes.js";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5000",
    credentials: true,
}));
app.use(express.json());

app.use("/api/exams", examRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/directory", directoryRoutes);

export default app;