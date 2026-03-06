import mongoose from "mongoose";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import PublishedExam from "../models/PublishedExam.js";
import { extractTextFromFile } from "../utils/extractText.js";
import { generateQuestionsFromText } from "../utils/aiQuestionGenerator.js";
import { storeTextToVector } from "../utils/vectorStore.js";
import { generateExamPDF } from "../utils/pdfGenerator.js";
import path from "path";
import fs from "fs";

/* =========================
   CREATE EXAM
========================= */
export const createExam = async (req, res) => {
  try {
    const filesData = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const text = await extractTextFromFile(file);
        filesData.push({
          originalName: file.originalname,
          extractedText: text,
        });
      }
    }

    const exam = await Exam.create({
      ...req.body,
      subjects: JSON.parse(req.body.subjects || "[]"),
      topics: JSON.parse(req.body.topics || "[]"),
      files: filesData,
      createdBy: req.user._id,
    });

    // Store in vector database
    for (const fileData of filesData) {
      await storeTextToVector(fileData.extractedText, {
        examId: exam._id.toString(),
        originalName: fileData.originalName,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   ADD MANUAL QUESTION
========================= */
export const addManualQuestion = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    if (exam.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Exam is published. Cannot add questions.",
      });
    }

    const question = await Question.create({
      ...req.body,
      examId: req.params.examId,
      source: "MANUAL",
      isApproved: false,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET QUESTIONS (TEACHER)
========================= */
export const getQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    // ✅ Prevent MongoDB crash
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const questions = await Question.find({ examId });

    return res.status(200).json({
      success: true,
      total: questions.length,
      data: questions,
    });

  } catch (error) {
    console.error("Get Questions Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   APPROVE QUESTION
========================= */
export const approveQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const exam = await Exam.findById(question.examId);
    if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    question.isApproved = true;
    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question approved successfully",
      data: question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   UPDATE QUESTION
========================= */
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const exam = await Exam.findById(question.examId);
    if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    if (exam.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Exam is published. Cannot edit question.",
      });
    }

    const allowedFields = ["text", "marks", "subject", "difficulty", "options", "correctAnswer"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   DELETE QUESTION
========================= */
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const exam = await Exam.findById(question.examId);
    if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    if (exam.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Exam is published. Cannot delete question.",
      });
    }

    await question.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   BULK APPROVE ALL QUESTIONS
========================= */
export const bulkApproveQuestions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    if (exam.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Exam is already published.",
      });
    }

    const result = await Question.updateMany(
      { examId: req.params.examId },
      { $set: { isApproved: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All questions approved successfully",
      approvedCount: result.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   TASK QUEUE FOR AI GENERATION
========================= */
const generationQueue = [];
let isProcessing = false;

const processNextInQueue = async () => {
  if (isProcessing || generationQueue.length === 0) return;

  isProcessing = true;
  const { examId, req, res } = generationQueue.shift();

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      console.error(`Exam ${examId} not found in queue`);
      isProcessing = false;
      processNextInQueue();
      return;
    }

    exam.status = "PROCESSING";
    exam.processingMessage = "Starting AI generation...";
    await exam.save();

    const combinedText = exam.files.map((f) => f.extractedText).join("\n");

    // Safety fallback for subjects and question count
    const subjectsToProcess = exam.subjects && exam.subjects.length > 0 ? exam.subjects : ["General"];
    const totalQty = exam.numberOfQuestions && exam.numberOfQuestions > 0 ? exam.numberOfQuestions : 4;

    // Process subjects sequentially
    for (let i = 0; i < subjectsToProcess.length; i++) {
      const subject = subjectsToProcess[i];
      exam.processingMessage = `Generating questions for ${subject}... (${i + 1}/${subjectsToProcess.length})`;
      await exam.save();

      const questions = await generateQuestionsFromText({
        text: combinedText,
        difficulty: exam.difficulty || "Medium",
        subjects: [subject], // Process one subject at a time
        count: Math.ceil(totalQty / subjectsToProcess.length), // Distribute questions
        language: exam.language || "English",
        topics: exam.topics,
      });

      if (questions && questions.length > 0) {
        await Question.insertMany(
          questions.map((q) => ({
            examId: exam._id,
            ...q,
            source: "AI",
            isApproved: false,
            createdBy: exam.createdBy,
          }))
        );
      }
    }

    exam.status = "REVIEW";
    exam.processingMessage = "AI generation complete.";
    await exam.save();

  } catch (error) {
    console.error("AI Generation Error:", error);
    try {
      const exam = await Exam.findById(examId);
      if (exam) {
        exam.status = "CREATED";
        exam.processingMessage = `Error: ${error.message}`;
        await exam.save();
      }
    } catch (dbError) {
      console.error("Error updating exam status after failure:", dbError);
    }
  } finally {
    isProcessing = false;
    processNextInQueue();
  }
};

/* =========================
   GENERATE AI QUESTIONS
========================= */
export const generateAIQuestions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    if (exam.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Exam is already published. AI generation is locked.",
      });
    }

    if (exam.status === "PROCESSING") {
      return res.status(400).json({
        success: false,
        message: "Exam is already being processed.",
      });
    }

    const combinedText = exam.files.map((f) => f.extractedText).join("\n");
    if (!combinedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No syllabus text available for AI generation",
      });
    }

    // Add to queue
    generationQueue.push({ examId: exam._id, req, res });

    // Start processing if not already
    processNextInQueue();

    return res.status(202).json({
      success: true,
      message: "AI question generation started. You will be notified once complete.",
      status: "PROCESSING"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   REGENERATE AI QUESTIONS
========================= */
export const regenerateAIQuestions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    if (exam.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Exam is already published. Regeneration is locked.",
      });
    }

    await Question.deleteMany({
      examId: req.params.examId,
      source: "AI",
    });

    return generateAIQuestions(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   IMPORT STATIC EXAM
========================= */
export const importStaticExam = async (req, res) => {
  try {
    const { examDetails, questions } = req.body;

    if (!examDetails || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Missing examDetails or questions array",
      });
    }

    // 1. Create the Exam document
    const exam = await Exam.create({
      ...examDetails,
      subjects: examDetails.subjects || [],
      topics: examDetails.topics || [],
      createdBy: req.user._id,
      status: "REVIEW", // Default to review so teacher can check
    });

    // 2. Format and Insert Questions
    const formattedQuestions = questions.map((q) => ({
      ...q,
      examId: exam._id,
      createdBy: req.user._id,
      source: "MANUAL",
      isApproved: true, // Auto-approve static data from frontend
    }));

    const result = await Question.insertMany(formattedQuestions);

    return res.status(201).json({
      success: true,
      message: "Static exam and questions imported successfully",
      data: {
        examId: exam._id,
        questionCount: result.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   PUBLISH EXAM
========================= */
export const publishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    if (exam.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Exam is already published",
      });
    }
    const lockedQuestions = await Question.find({
      examId: exam._id,
      isApproved: true
    }).lean();

    if (!lockedQuestions.length) {
      return res.status(400).json({
        success: false,
        message: "No approved questions. Cannot publish exam.",
      });
    }

    if (!approvedQuestions.length) {
      return res.status(400).json({
        success: false,
        message: "No approved questions. Cannot publish exam.",
      });
    }

    const totalMarks = lockedQuestions.reduce(
      (sum, q) => sum + q.marks,
      0
    );

    // Create a directory for exams if it doesn't exist
    const examsDir = path.join(process.cwd(), "uploads", "exams");
    if (!fs.existsSync(examsDir)) {
      fs.mkdirSync(examsDir, { recursive: true });
    }

    const pdfFilename = `exam_${exam._id}_${Date.now()}.pdf`;
    const pdfPath = path.join(examsDir, pdfFilename);

    const examData = {
      title: exam.title,
      description: exam.description,
      instructions: exam.instructions,
      duration: exam.duration,
      subjects: exam.subjects,
      difficulty: exam.difficulty,
      language: exam.language,
      topics: exam.topics,
      totalMarks: totalMarks,
    };

    // Generate PDF
    await generateExamPDF(
      examData,
      lockedQuestions,
      pdfPath
    );

    const publishedExam = await PublishedExam.create({
      examId: exam._id,
      createdBy: req.user._id,   // ✅ ADD THIS
      ...examData,
      questions: lockedQuestions.map((q) => ({

        questionId: q._id,

        text: q.text,

        options: q.options,

        correctAnswer: q.correctAnswer,

        marks: q.marks,

      })),

      totalMarks,
      pdfPath: `/uploads/exams/${pdfFilename}`,
      publishedAt: new Date(),
    });

    exam.status = "PUBLISHED";
    await exam.save();

    const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
    const pdfUrl = `${serverUrl}/uploads/exams/${pdfFilename}`;

    return res.status(200).json({
      success: true,
      message: "Exam published and PDF generated successfully",
      totalQuestions: lockedQuestions.length,
      totalMarks,
      pdfUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET EXAM STATUS
========================= */
export const getExamStatus = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: exam.status,
        processingMessage: exam.processingMessage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET ALL EXAMS (TEACHER)
========================= */
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    // For each exam, count number of questions
    const examsWithCount = await Promise.all(exams.map(async (exam) => {
      const questionsCount = await Question.countDocuments({ examId: exam._id });
      return {
        ...exam._doc,
        questionsCount
      };
    }));

    return res.status(200).json({
      success: true,
      count: examsWithCount.length,
      data: examsWithCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET PUBLISHED EXAMS
========================= */
export const getPublishedExams = async (req, res) => {
  try {
    const publishedExams = await PublishedExam.find({
      createdBy: req.user._id   // ✅ FILTER BY USER
    }).sort({ publishedAt: -1 });

    return res.status(200).json({
      success: true,
      count: publishedExams.length,
      data: publishedExams,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET PUBLISHED EXAM BY ID
========================= */
export const getPublishedExamById = async (req, res) => {
  try {
    const publishedExam = await PublishedExam.findOne({
      _id: req.params.id,
      createdBy: req.user._id   // ✅ Prevent access to others
    });

    if (!publishedExam) {
      return res.status(404).json({
        success: false,
        message: "Published exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: publishedExam,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* =========================
   DELETE EXAM (TEACHER)
========================= */
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Only owner can delete
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this exam",
      });
    }

    // 🔥 If exam was published → remove published record
    if (exam.status === "PUBLISHED") {
      const publishedExam = await PublishedExam.findOne({
        examId: exam._id,
      });

      if (publishedExam) {
        // Optional: delete PDF file from server
        if (publishedExam.pdfPath) {
          const filePath = path.join(process.cwd(), publishedExam.pdfPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        await publishedExam.deleteOne();
      }
    }

    // Delete related questions
    await Question.deleteMany({ examId: exam._id });

    // Delete exam itself
    await exam.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully (including published data if existed)",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};