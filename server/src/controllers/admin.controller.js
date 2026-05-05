import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";

export const getStats = async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalExams = await Exam.countDocuments();
    const totalQuestions = await Question.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        totalTeachers,
        totalStudents,
        totalExams,
        totalQuestions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("createdBy", "firstName lastName email college city state")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: exams
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 });

    // Aggregate real stats
    const studentStats = await Attempt.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalExams: { $count: {} },
          totalPoints: { $sum: "$score" },
          totalPossibleMarks: { $sum: "$totalMarks" },
          avgPercentage: {
            $avg: {
              $cond: [
                { $gt: ["$totalMarks", 0] },
                { $multiply: [{ $divide: ["$score", "$totalMarks"] }, 100] },
                0
              ]
            }
          }
        }
      }
    ]);

    const statsMap = studentStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = {
        totalExams: stat.totalExams,
        avgScore: Math.round(stat.avgPercentage)
      };
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: students.map(s => ({
        ...s.toObject(),
        totalExams: statsMap[s._id.toString()]?.totalExams || 0,
        avgScore: statsMap[s._id.toString()]?.avgScore || 0,
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 });

    // Aggregate real stats for teachers
    const teacherStats = await Exam.aggregate([
      {
        $group: {
          _id: "$createdBy",
          totalExams: { $count: {} }
        }
      }
    ]);

    const statsMap = teacherStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = {
        totalExams: stat.totalExams
      };
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: teachers.map(t => ({
        ...t.toObject(),
        totalExams: statsMap[t._id.toString()]?.totalExams || 0,
        totalQuestions: 0, // Questions are nested in exams, hard to count simply without more logic
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user || user.role !== "teacher") {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    await User.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: "Teacher deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user || user.role !== "student") {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    await User.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
