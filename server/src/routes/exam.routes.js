import express from "express";
import {
  createExam,
  addManualQuestion,
  getQuestions,
  approveQuestion,
  updateQuestion,
  deleteQuestion,
  bulkApproveQuestions,
  publishExam,
  getPublishedExam,
  generateAIQuestions,
  regenerateAIQuestions,
  getExamStatus
} from "../controllers/exam.controller.js";

import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";


const router = express.Router();

// CREATE EXAM (Teacher only)
router.post(
  "/create",
  protect,
  upload.array("files", 5),
  createExam
);

// ADD MANUAL QUESTION (Teacher only)
router.post(
  "/:examId/question/manual",
  protect,
  addManualQuestion
);

// GET QUESTIONS (Teacher only)
router.get(
  "/:examId/questions",
  protect,
  getQuestions
);

// APPROVE QUESTION (Teacher only)
router.patch(
  "/question/:id/approve",
  protect,
  approveQuestion
);

// EDIT QUESTION (Teacher only)
router.patch(
  "/question/:id",
  protect,
  updateQuestion
);

// DELETE QUESTION (Teacher only)
router.delete(
  "/question/:id",
  protect,
  deleteQuestion
);

// BULK APPROVE ALL QUESTIONS (Teacher only)
router.patch(
  "/:examId/questions/approve-all",
  protect,
  bulkApproveQuestions
);

// PUBLISH EXAM (Teacher only)
router.post(
  "/:examId/publish",
  protect,
  publishExam
);

// GENERATE AI QUESTIONS
router.post(
  "/:examId/generate",
  protect,
  generateAIQuestions
);

// REGENERATE AI QUESTIONS
router.post(
  "/:examId/regenerate",
  protect,
  regenerateAIQuestions
);

// GET EXAM STATUS
router.get(
  "/:examId/status",
  protect,
  getExamStatus
);
// GET PUBLIC PUBLISHED EXAM DETAILS (For Candidates)
router.get(
  "/public/:publishedExamId",
  getPublishedExam
);

export default router;