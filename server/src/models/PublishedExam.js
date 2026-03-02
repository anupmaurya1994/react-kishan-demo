import mongoose from "mongoose";

const publishedExamSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam"
    },
    questions: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        text: String,
        options: [String],
        marks: Number
      }
    ],
    totalMarks: Number,
    pdfPath: String,
    publishedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("PublishedExam", publishedExamSchema);