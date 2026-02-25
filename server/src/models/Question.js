import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam"
    },
    text: String,
    marks: Number,
    subject: String,
    difficulty: String,

    source: {
      type: String,
      enum: ["AI", "MANUAL"]
    },

    isApproved: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);