import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import PublishedExam from "../models/PublishedExam.js";
import { extractTextFromFile } from "../utils/extractText.js";
import { generateQuestionsFromText } from "../utils/aiQuestionGenerator.js";
import { storeTextToVector } from "../utils/vectorStore.js";

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

    const questions = await Question.find({
      examId: req.params.examId,
    });

    return res.status(200).json({
      success: true,
      total: questions.length,
      data: questions,
    });
  } catch (error) {
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

    const allowedFields = ["text", "marks", "subject", "difficulty"];
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

    // Process subjects sequentially
    for (let i = 0; i < exam.subjects.length; i++) {
      const subject = exam.subjects[i];
      exam.processingMessage = `Generating questions for ${subject}... (${i + 1}/${exam.subjects.length})`;
      await exam.save();

      const questions = await generateQuestionsFromText({
        text: combinedText,
        difficulty: exam.difficulty,
        subjects: [subject], // Process one subject at a time
        count: Math.ceil(exam.numberOfQuestions / exam.subjects.length), // Distribute questions
        language: exam.language,
      });

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

    const approvedQuestions = await Question.find({
      examId: exam._id,
      isApproved: true,
    });

    if (!approvedQuestions.length) {
      return res.status(400).json({
        success: false,
        message: "No approved questions. Cannot publish exam.",
      });
    }

    const totalMarks = approvedQuestions.reduce(
      (sum, q) => sum + q.marks,
      0
    );

    const publishedExam = await PublishedExam.create({
      examId: exam._id,
      questions: approvedQuestions.map((q) => ({
        questionId: q._id,
        text: q.text,
        marks: q.marks,
      })),
      totalMarks,
      publishedAt: new Date(),
    });

    exam.status = "PUBLISHED";
    await exam.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const challengeLink = `${clientUrl}/challenge/${publishedExam._id}`;

    return res.status(200).json({
      success: true,
      message: "Exam published successfully",
      totalQuestions: approvedQuestions.length,
      totalMarks,
      challengeLink,
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
   GET PUBLISHED EXAM (PUBLIC)
========================= */
export const getPublishedExam = async (req, res) => {
  try {
    const publishedExam = await PublishedExam.findById(
      req.params.publishedExamId
    ).populate({
      path: 'examId',
      select: 'title instructions duration subjects fileCount',
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
      message: "Invalid exam link",
    });
  }
};

