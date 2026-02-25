import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    instructions: String,
    difficulty: String,
    subjects: [String],
    language: String,
    numberOfQuestions: Number,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    files: [
      {
        originalName: String,
        extractedText: String
      }
    ],

    status: {
      type: String,
      enum: ["CREATED", "PROCESSING", "REVIEW", "PUBLISHED"],
      default: "CREATED"
    },
    processingMessage: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);