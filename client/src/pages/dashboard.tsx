import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import AppHeader from "./AppHeader";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, FileUp, Sparkles, CheckCircle2, MoreVertical, Download, Trash2, Zap, Award, Tags, Pencil, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateExamPDF, generateExamPDFBlobUrl } from "../lib/pdf-generator";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
import { Spinner } from "@/components/ui/spinner";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  type Exam = {
    _id: string;
    id?: number;
    title: string;
    subject: string;
    date?: string;
    questions?: number;
    questionsCount?: number;
    createdAt?: string;
    status: string;
    questionData?: any[];
    timeLimit?: number;
  };

  const [exams, setExams] = useState<Exam[]>([]);
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem('dashboard_current_page') || '1')
  );

  useEffect(() => {
    localStorage.setItem('dashboard_current_page', currentPage.toString());
  }, [currentPage]);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [previewExam, setPreviewExam] = useState<any>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Whenever previewExam changes, generate a live PDF blob URL for the iframe
  useEffect(() => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl); // revoke old
    if (!previewExam) { setPreviewPdfUrl(null); return; }

    const generatePreview = async () => {
      try {
        let examDataForPdf = { ...previewExam };
        
        // If it's a teacher and questions aren't loaded yet, fetch them for the preview
        if (user?.role !== "student" && !previewExam.questions?.length && !previewExam.questionData?.length) {
          const [examRes, questionsRes] = await Promise.all([
            apiRequest("GET", `/api/exams/${previewExam._id}`),
            apiRequest("GET", `/api/exams/${previewExam._id}/questions`),
          ]);
          
          if (examRes.ok && questionsRes.ok) {
            const examDetail = await examRes.json();
            const questionsData = await questionsRes.json();
            
            const fullExam = examDetail?.success ? examDetail.data : previewExam;
            examDataForPdf = {
              ...previewExam,
              ...fullExam,
              timeLimit: fullExam?.timeLimit ?? fullExam?.duration ?? previewExam?.timeLimit,
              timeLimitType: fullExam?.timeLimitType ?? previewExam?.timeLimitType,
              questions: questionsData?.success ? questionsData.data : []
            };
          }
        }

        const url = generateExamPDFBlobUrl(examDataForPdf);
        setPreviewPdfUrl(url);
      } catch (e) {
        console.error("Preview PDF generation failed:", e);
        setPreviewPdfUrl(null);
      }
    };

    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewExam]);
  const [confirmTakeExam, setConfirmTakeExam] = useState<any>(null);
  const [takingExam, setTakingExam] = useState<any>(null);
  const [examCurrentPage, setExamCurrentPage] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, number>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());
  const [examResult, setExamResult] = useState<any>(null);
  const [paginationStart, setPaginationStart] = useState(0);
  const [examTimeLeft, setExamTimeLeft] = useState<number | null>(null);
  const [perQuestionTimeLeft, setPerQuestionTimeLeft] = useState<Record<number, number>>({});
  const [lockedQuestions, setLockedQuestions] = useState<Set<number>>(new Set());
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [examFilter, setExamFilter] = useState<'all' | 'completed' | 'pending'>(
    (localStorage.getItem('dashboard_exam_filter') as any) || 'all'
  );

  useEffect(() => {
    localStorage.setItem('dashboard_exam_filter', examFilter);
  }, [examFilter]);
  const pageSize = 6;

  const filteredExams = exams.filter(exam => {
    if (user?.role !== "student") return true;
    if (examFilter === 'all') return true;
    if (examFilter === 'completed') return (exam as any).isCompleted;
    if (examFilter === 'pending') return !(exam as any).isCompleted;
    return true;
  });

  const totalPages = Math.ceil(filteredExams.length / pageSize);
  const paginatedExams = filteredExams.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // const [exams, setExams] = useState<Exam[]>([]);

  // useEffect(() => {
  //   const published = JSON.parse(localStorage.getItem("published_exams") || "[]");
  //   setExams(published);
  // }, []);

  // FETCH EXAMS FROM BACKEND

  const fetchExams = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === "student" ? "/api/exams/student/all" : "/api/exams";
      const res = await apiRequest("GET", endpoint);
      const data = await res.json();

      if (data.success) {
        // Persist completion status across refreshes using localStorage
        const completedKey = `completed_exams_${user?._id || user?.id}`;
        let completedIds: string[] = [];
        try {
          completedIds = JSON.parse(localStorage.getItem(completedKey) || "[]");
        } catch (e) {
          completedIds = [];
        }

        const enrichedExams = data.data.map((exam: any) => ({
          ...exam,
          isCompleted: exam.isCompleted || completedIds.includes(exam._id)
        }));

        setExams(enrichedExams);
      } else {
        toast.error("Failed to load exams");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // const handleDownloadPDF = async (e: React.MouseEvent, exam: Exam) => 
  // { e.stopPropagation(); 
  // try { const res = await apiRequest("GET", /api/exams/${exam._id}/questions);
  //  const data = await res.json(); 
  // if (data.success && data.data) { 
  // generateExamPDF({ ...exam, questions: data.data }); } 
  // else { generateExamPDF(exam); } } 
  // catch (error) { console.error("Error fetching questions for PDF:", error); generateExamPDF(exam); } };

  useEffect(() => {
    if (takingExam) {
      setVisitedQuestions(prev => new Set(prev).add(examCurrentPage));
    }
  }, [examCurrentPage, takingExam]);

  // Overall Exam Timer Logic
  useEffect(() => {
    let timer: any;
    if (takingExam && !examResult && takingExam.timeLimitType !== "per-question" && !isTimeUp) {
      timer = setInterval(() => {
        setExamTimeLeft(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            setIsTimeUp(true);
            toast.error("Time is up! Submitting exam in 3 seconds...", { duration: 3000, icon: '⏰' });
            setTimeout(() => {
              handleSubmitExam();
            }, 3000);
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [takingExam, examResult, isTimeUp]);

  // Per-Question Timer Logic
  useEffect(() => {
    let timer: any;
    if (takingExam && !examResult && takingExam.timeLimitType === "per-question") {
      timer = setInterval(() => {
        setPerQuestionTimeLeft(prev => {
          const currentValue = prev[examCurrentPage];
          if (currentValue === undefined) return prev;

          if (currentValue <= 1) {
            setLockedQuestions(l => new Set(l).add(examCurrentPage));
            if (examCurrentPage < takingExam.questions.length - 1) {
              setExamCurrentPage(p => p + 1);
            } else {
              handleSubmitExam();
            }
            return { ...prev, [examCurrentPage]: 0 };
          }
          return { ...prev, [examCurrentPage]: currentValue - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [takingExam, examCurrentPage, examResult]);

  const handleSubmitExam = () => {
    if (!takingExam) return;
    const questions = takingExam.questions;
    let correctCount = 0;
    questions.forEach((q: any, idx: number) => {
      const studentAns = studentAnswers[idx];
      const correctAns = q.correctAnswer;
      if (studentAns !== undefined && Number(studentAns) === Number(correctAns)) {
        correctCount++;
      }
    });

    // Mark the exam as completed in the local list so it moves to the "Completed" section
    setExams(prev => prev.map(e => 
      e._id === takingExam._id ? { ...e, isCompleted: true } : e
    ));

    // Persist to localStorage so it survives refresh
    try {
      const completedKey = `completed_exams_${user?._id || user?.id}`;
      const completedIds = JSON.parse(localStorage.getItem(completedKey) || "[]");
      if (!completedIds.includes(takingExam._id)) {
        localStorage.setItem(completedKey, JSON.stringify([...completedIds, takingExam._id]));
      }
    } catch (e) {
      console.error("Error persisting completion status:", e);
    }

    setExamResult({
      total: questions.length,
      score: correctCount,
      percentage: (correctCount / questions.length) * 100
    });
    toast.success(`Exam submitted! Score: ${correctCount}/${questions.length}`);
  };

  const handleDownloadPDF = async (e: React.MouseEvent, exam: Exam) => {
    e.stopPropagation();

    // If the user is a student or we already have the questions, generate immediately
    // Students don't have access to the raw /api/exams endpoints (hence the 404)
    if (user?.role === "student" || (exam as any).questions?.length > 0) {
      toast.info("Generating PDF...");
      // Map questions if needed
      const formattedQuestions = (exam as any).questions?.map((q: any) => ({
        ...q,
        question: q.text || q.question
      })) || [];
      generateExamPDF({ ...exam, questions: formattedQuestions });
      return;
    }

    toast.info("Preparing PDF...", { id: "pdf-toast" });

    try {
      // Fetch full exam details (includes duration/timeLimit) and questions in parallel
      const [examRes, questionsRes] = await Promise.all([
        apiRequest("GET", `/api/exams/${exam._id}`),
        apiRequest("GET", `/api/exams/${exam._id}/questions`),
      ]);

      const examDetail = await examRes.json();
      const questionsData = await questionsRes.json();

      const fullExam = examDetail?.success ? examDetail.data : exam;

      // Resolve timeLimit from full exam details (backend stores it as 'duration')
      const resolvedTimeLimit =
        fullExam?.timeLimit ??
        fullExam?.duration ??
        exam?.timeLimit ??
        null;

      const resolvedTimeLimitType =
        fullExam?.timeLimitType ??
        (exam as any)?.timeLimitType ??
        null;

      const examForPDF: any = {
        ...exam,
        ...fullExam,
        timeLimit: resolvedTimeLimit,
        timeLimitType: resolvedTimeLimitType,
        questions:
          questionsData?.success && questionsData?.data
            ? questionsData.data
            : [],
      };

      toast.success("PDF generated!", { id: "pdf-toast" });
      generateExamPDF(examForPDF);
    } catch (error) {
      console.error("Error fetching exam data for PDF:", error);
      toast.error("Failed to generate PDF. Please try again.", { id: "pdf-toast" });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/exams/${id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      return data;
    },

    onSuccess: () => {
      toast.success("Exam deleted successfully");
      fetchExams();
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete exam";

      toast.error(message);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-inter">
      <AppHeader />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 flex flex-col items-center border border-slate-100">
            <Spinner className="size-16 text-primary" />
            <p className="mt-6 text-slate-900 font-extrabold text-xl animate-pulse">Fetching your exams...</p>
            <p className="mt-2 text-slate-400 font-medium italic">Just a moment while we load everything.</p>
          </div>
        </div>
      ) : (
        /* Main Content */
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back, {user?.name || "Guest"} 👋</h1>
              <p className="text-slate-500 font-medium">
                {user?.role === "student"
                  ? "Browse and download published exams to practice."
                  : "Here's an overview of your recent exams and generations."}
              </p>
            </div>
            {user?.role !== "student" && (
              <Button
                size="lg"
                className="rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2 px-6 active:scale-95"
                onClick={() => {
                  sessionStorage.removeItem("current_exam_data");
                  sessionStorage.removeItem("isEditingExam");
                  setLocation("/create-exam");
                }}
                data-testid="button-create-exam"
              >
                <Plus className="h-5 w-5" />
                Create New Exam
              </Button>
            )}
          </div>

          {/* Quick Actions / Stats (Teacher Only) */}
          {user?.role !== "student" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-blue-50/50 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <FileUp className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                  <CardDescription className="font-semibold text-blue-600/80 uppercase tracking-wider text-xs">Step 1</CardDescription>
                  <CardTitle className="text-xl text-slate-800">Upload Materials</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-slate-500 text-sm">Upload PDFs, DOCX, or images containing your syllabus or notes.</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-purple-50/50 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                  <CardDescription className="font-semibold text-purple-600/80 uppercase tracking-wider text-xs">Step 2</CardDescription>
                  <CardTitle className="text-xl text-slate-800">AI Generation</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-slate-500 text-sm">Our AI instantly drafts MCQs, short answers, and essay questions.</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-emerald-50/50 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle2 className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                  <CardDescription className="font-semibold text-emerald-600/80 uppercase tracking-wider text-xs">Step 3</CardDescription>
                  <CardTitle className="text-xl text-slate-800">Review & Publish</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-slate-500 text-sm">Edit questions, adjust difficulty, and publish to your students.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Exams Section */}
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Recent Exams</h2>
              
              {user?.role === "student" && (
                <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-[1.25rem] w-full sm:w-auto border border-slate-200/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-xl px-5 py-2 font-bold transition-all duration-300 ${examFilter === 'all' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-primary hover:bg-white/50'}`}
                    onClick={() => {
                      setExamFilter('all');
                      setCurrentPage(1);
                    }}
                  >
                    All Exams
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-xl px-5 py-2 font-bold transition-all duration-300 ${examFilter === 'pending' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'}`}
                    onClick={() => {
                      setExamFilter('pending');
                      setCurrentPage(1);
                    }}
                  >
                    Not Completed
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-xl px-5 py-2 font-bold transition-all duration-300 ${examFilter === 'completed' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-emerald-600 hover:bg-white/50'}`}
                    onClick={() => {
                      setExamFilter('completed');
                      setCurrentPage(1);
                    }}
                  >
                    Completed
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedExams.map((exam, index) => (
                <Card
                  key={exam._id}
                  className="border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-3xl group cursor-pointer bg-white overflow-hidden relative"
                  data-testid={`card-exam-${exam.id}`}
                  onClick={async () => {
                    if (user?.role === "student") {
                      setPreviewExam(exam);
                      return;
                    }
                    toast.loading("Loading exam data...", { id: "exam-load" });
                    try {
                      const res = await apiRequest("GET", `/api/exams/${exam._id}/questions`);
                      const data = await res.json();
                      let questions = [];
                      if (data.success && data.data) {
                        questions = data.data.map((q: any) => ({
                          ...q,
                          isLocked: q.isApproved || false,
                          id: q.id || q._id
                        }));
                      }

                      const draftData = {
                        _id: exam._id,
                        title: exam.title,
                        subject: exam.subject || (exam as any).subjects?.[0] || "",
                        timeLimit: exam.timeLimit || (exam as any).duration || 60,
                        topics: (exam as any).topics?.join(", ") || (exam as any).topics || "",
                        difficulty: (exam as any).difficulty || "medium",
                        description: (exam as any).description || "",
                        numberOfQuestions: (exam as any).numberOfQuestions || questions.length || 4,
                        status: exam.status,
                        questions: questions,
                        files: (exam as any).files || []
                      };
                      sessionStorage.setItem("current_exam_data", JSON.stringify(draftData));
                      toast.dismiss("exam-load");

                      const isDraftStatus = ["Draft", "DRAFT", "CREATED"].includes(exam.status);

                      if (isDraftStatus) {
                        sessionStorage.setItem("isEditingExam", "true");
                        setLocation("/create-exam");
                      } else {
                        setLocation(`/exams/${exam._id}/questions`);
                      }
                    } catch (error) {
                      toast.dismiss("exam-load");
                      toast.error("Failed to load exam data");
                    }
                  }}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 group-hover:h-2 ${exam.difficulty?.toUpperCase() === 'HARD' ? 'bg-rose-500' :
                      exam.difficulty?.toUpperCase() === 'MEDIUM' ? 'bg-amber-500' :
                        exam.difficulty?.toUpperCase() === 'EASY' ? 'bg-emerald-500' :
                          'bg-primary'
                    }`} />

                  {/* Sequential Number */}
                  <div className="absolute top-8 right-8 text-7xl font-black text-slate-200/40 pointer-events-none group-hover:text-primary/10 transition-all duration-500 italic tracking-tighter z-0 select-none">
                    {String((currentPage - 1) * pageSize + index + 1).padStart(2, '0')}
                  </div>

                  <CardHeader className="pb-4 px-6 pt-8">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="secondary"
                          className={`w-fit rounded-full px-3 py-1 font-bold text-[9px] uppercase tracking-widest border-0 ${user?.role === "student"
                              ? ((exam as any).isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')
                              : (exam.status?.toUpperCase() === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-600'
                                : exam.status?.toUpperCase() === 'PROCESSING'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-indigo-50 text-indigo-600')
                            }`}
                        >
                        {user?.role === "student"
                          ? ((exam as any).isCompleted ? 'Exam Completed' : 'Not Completed')
                          : (exam.status || 'Draft')}
                        </Badge>
                        <CardDescription className="text-sm font-bold text-primary/60 mt-1 uppercase tracking-tight line-clamp-1">{exam.subject}</CardDescription>
                      </div>

                      {user?.role === "student" ? (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-slate-50 hover:bg-emerald-100 hover:text-emerald-600 transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmTakeExam(exam);
                            }}
                            title="Take Exam"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-slate-50 hover:bg-primary/10 hover:text-primary transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(e, exam);
                            }}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-50 hover:bg-primary/10 hover:text-primary transition-all active:scale-90 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 w-56">
                            <DropdownMenuItem
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl text-slate-600 hover:text-primary transition-colors focus:bg-primary/5 focus:text-primary font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPDF(e, exam);
                              }}
                            >
                              <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                                <Download className="h-4 w-4" />
                              </div>
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl text-rose-600 hover:bg-rose-50 transition-colors focus:bg-rose-50 focus:text-rose-700 font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExamToDelete(exam);
                              }}
                            >
                              <div className="bg-rose-50 p-2 rounded-lg text-rose-500">
                                <Trash2 className="h-4 w-4" />
                              </div>
                              Delete Exam
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <CardTitle className="text-xl font-extrabold text-slate-900 leading-tight mt-3 group-hover:text-primary transition-colors line-clamp-2">
                      {exam.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-8 px-6">
                    <div className="flex flex-col gap-4">
                      {/* Primary Stats Row */}
                      <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-[13px] text-slate-500 font-semibold bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-2">
                          <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span>{exam.questionsCount || (exam as any).questions?.length || 0} Qs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span>{exam.timeLimit || (exam as any).duration || 60} mins</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                          </div>
                          <span className="capitalize">{(exam as any).difficulty || "Medium"}</span>
                        </div>
                      </div>

                      {/* Secondary Details */}
                      <div className="space-y-3 px-1">
                        <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
                          <Award className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="truncate">Type: <span className="text-slate-600 font-bold capitalize">{(exam as any).timeLimitType || "Overall"}</span></span>
                        </div>

                        <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-blue-400" />
                          <span className="truncate">Published: <span className="text-slate-600 font-bold">{new Date(exam.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></span>
                        </div>

                        {((exam as any).topics?.length > 0 || (exam as any).subjects?.length > 0) && (
                          <div className="flex items-start gap-2 text-[12px] text-slate-400 font-medium">
                            <Tags className="h-3.5 w-3.5 mt-0.5 text-emerald-400" />
                            <div className="flex flex-wrap gap-1">
                              {((exam as any).topics || (exam as any).subjects || []).slice(0, 3).map((tag: string, idx: number) => (
                                <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                  {tag}
                                </span>
                              ))}
                              {((exam as any).topics?.length > 3) && <span className="text-[10px] text-slate-400">+{(exam as any).topics.length - 3} more</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  {/* Decorative Element */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
                </Card>
              ))}

              {exams.length === 0 && (
                <div
                  className="lg:col-span-3 md:col-span-2 py-16 flex flex-col items-center justify-center bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    sessionStorage.removeItem("current_exam_data");
                    sessionStorage.removeItem("isEditingExam");
                    setLocation("/create-exam");
                  }}
                >
                  <div className="bg-primary/10 p-6 rounded-full mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                    <Plus className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 group-hover:text-primary transition-colors">No exams found</h3>
                  <p className="text-slate-500 mt-2 font-medium">You haven't created any exams yet.</p>


                  <Button
                    variant="outline"
                    className="mt-8 rounded-full px-8 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    Create Your First Exam
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {exams.length > pageSize && (
              <div className="mt-10 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium text-slate-500">
                    Showing <span className="text-primary font-bold">{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, exams.length)}</span> of <span className="text-primary font-bold">{exams.length}</span> exams
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-6 rounded-2xl text-xs font-bold border-slate-100 hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm active:scale-95"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-6 rounded-2xl text-xs font-bold border-slate-100 hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm active:scale-95"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This will permanently delete the exam <span className="font-bold text-slate-900">"{examToDelete?.title}"</span> and all its associated questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-full border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg shadow-rose-200"
              onClick={() => {
                if (examToDelete) {
                  deleteMutation.mutate(examToDelete._id);
                  setExamToDelete(null);
                }
              }}
            >
              {deleteMutation.isPending ? <Spinner className="size-4" /> : "Delete Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog (Student) */}
      <Dialog open={!!previewExam} onOpenChange={(open) => !open && setPreviewExam(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <DialogHeader className="p-6 pb-2 border-b bg-white relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-extrabold text-slate-900">{previewExam?.title}</DialogTitle>
                <p className="text-slate-500 font-medium text-sm mt-1">{previewExam?.subject} • {previewExam?.questionsCount || 0} Questions</p>
              </div>
              <Button
                className="rounded-full gap-2 px-6 shadow-lg shadow-primary/20"
                onClick={(e) => {
                  handleDownloadPDF(e as any, previewExam);
                }}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 relative">
            {previewPdfUrl ? (
              <iframe
                src={previewPdfUrl}
                className="w-full h-full border-0"
                title="Exam Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full flex-col text-slate-400 gap-4">
                <FileText className="size-16 opacity-20 animate-pulse" />
                <p className="font-bold text-lg">Generating preview...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Take Exam Confirmation */}
      <AlertDialog open={!!confirmTakeExam} onOpenChange={(open) => !open && setConfirmTakeExam(null)}>
        <AlertDialogContent className="rounded-[2rem] border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900 text-center">Are you sure you want to take the exam?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-center">
              You are about to start <span className="font-bold text-slate-900">"{confirmTakeExam?.title}"</span>.
              Once started, you will be able to see the questions one by one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 justify-center gap-4 flex-col sm:flex-row">
            <AlertDialogCancel className="rounded-full border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 px-8 h-12 w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 px-10 h-12 w-full sm:w-auto"
              onClick={async () => {
                const exam = confirmTakeExam;
                setConfirmTakeExam(null);

                // For students, we already have the questions embedded in the PublishedExam object
                if (user?.role === "student") {
                  if (exam.questions && exam.questions.length > 0) {
                    // Map questions to match the expected format (PublishedExam uses 'text' field)
                    const formattedQuestions = exam.questions.map((q: any) => ({
                      ...q,
                      question: q.text || q.question // Handle both formats
                    }));
                    setTakingExam({ ...exam, questions: formattedQuestions });
                    setExamCurrentPage(0);
                    setPaginationStart(0);
                    setStudentAnswers({});
                    setVisitedQuestions(new Set([0]));
                    setExamResult(null);

                    // Initialize timers
                    const limit = exam.timeLimit || (exam as any).duration || 60;
                    setExamTimeLeft(limit * 60);

                    const initial: Record<number, number> = {};
                    formattedQuestions.forEach((_: any, i: number) => {
                      initial[i] = limit * 60;
                    });
                    setPerQuestionTimeLeft(initial);

                    toast.success("Exam started!");
                  } else {
                    toast.error("No questions found in this exam.");
                  }
                  return;
                }

                // For teachers, we fetch the questions from the backend
                toast.loading("Loading exam questions...", { id: "take-exam-load" });
                try {
                  const res = await apiRequest("GET", `/api/exams/${exam._id}/questions`);
                  const data = await res.json();
                  if (data.success && data.data) {
                    setTakingExam({ ...exam, questions: data.data });
                    setExamCurrentPage(0);
                    setPaginationStart(0);
                    setStudentAnswers({});
                    setVisitedQuestions(new Set([0]));
                    setExamResult(null);

                    // Initialize timers
                    const limit = exam.timeLimit || (exam as any).duration || 60;
                    setExamTimeLeft(limit * 60);

                    const initial: Record<number, number> = {};
                    data.data.forEach((_: any, i: number) => {
                      initial[i] = limit * 60;
                    });
                    setPerQuestionTimeLeft(initial);

                    toast.success("Exam started!", { id: "take-exam-load" });
                  } else {
                    throw new Error(data.message || "Failed to load questions");
                  }
                } catch (error) {
                  toast.error("Failed to start exam", { id: "take-exam-load" });
                }
              }}
            >
              Yes, Start Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Taking Exam Modal */}
      <Dialog open={!!takingExam} onOpenChange={(open) => !open && setTakingExam(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-2xl">
          <DialogHeader className="p-8 pb-4 border-b bg-white relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <Pencil className="h-5 w-5 text-emerald-600" />
                  </div>
                  {takingExam?.title}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-0 font-bold px-3">
                    {takingExam?.subject || takingExam?.subjects?.[0]}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5" />
                    {takingExam?.timeLimit || takingExam?.duration || 60} Minutes
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {takingExam?.timeLimitType === "per-question" ? "Question Timer" : "Total Time Left"}
                </p>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                  <Clock className={`h-5 w-5 ${(takingExam?.timeLimitType === "per-question"
                      ? (perQuestionTimeLeft[examCurrentPage] ?? (takingExam.timeLimit * 60))
                      : (examTimeLeft ?? 0)) < 60 ? "text-rose-500 animate-pulse" : "text-primary"
                    }`} />
                  <p className={`text-2xl font-black tabular-nums ${(takingExam?.timeLimitType === "per-question"
                      ? (perQuestionTimeLeft[examCurrentPage] ?? (takingExam.timeLimit * 60))
                      : (examTimeLeft ?? 0)) < 60 ? "text-rose-500" : "text-slate-900"
                    }`}>
                    {(() => {
                      const seconds = takingExam?.timeLimitType === "per-question"
                        ? (perQuestionTimeLeft[examCurrentPage] ?? (takingExam.timeLimit * 60))
                        : (examTimeLeft ?? 0);
                      const mins = Math.floor(seconds / 60);
                      const secs = seconds % 60;
                      return `${mins}:${secs.toString().padStart(2, '0')}`;
                    })()}
                  </p>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mt-1">
                  Question {examCurrentPage + 1} / {takingExam?.questions?.length || 0}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 p-8 bg-slate-50/50 overflow-y-auto relative">
            {/* Time Up Blocking Overlay */}
            {isTimeUp && !examResult && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center text-center p-6">
                <div className="bg-rose-500 text-white p-6 rounded-3xl shadow-2xl animate-bounce mb-4">
                  <Clock className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase">Time is up!</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Submitting your exam automatically...</p>
              </div>
            )}

            {examResult ? (
              <div className="max-w-md mx-auto py-10 space-y-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900">Exam Complete!</h2>
                  <p className="text-slate-500 font-medium">You have successfully submitted the assessment.</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Score</p>
                      <p className="text-3xl font-black text-primary">{examResult.score} <span className="text-slate-300 text-xl">/</span> {examResult.total}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Percentage</p>
                      <p className={`text-3xl font-black ${examResult.percentage >= 40 ? 'text-emerald-500' : 'text-rose-500'}`}>{Math.round(examResult.percentage)}%</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${examResult.percentage >= 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${examResult.percentage}%` }}
                      />
                    </div>
                    <p className="text-center text-sm font-bold text-slate-500">
                      {examResult.percentage >= 80 ? '🏆 Outstanding Performance!' :
                        examResult.percentage >= 60 ? '👏 Great job!' :
                          examResult.percentage >= 40 ? '👍 Good attempt' :
                            'Keep practicing!'}
                    </p>
                  </div>

                  <Button
                    className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
                    onClick={() => {
                      setTakingExam(null);
                      setExamResult(null);
                    }}
                  >
                    Close & Return Home
                  </Button>
                </div>
              </div>
            ) : takingExam?.questions && takingExam.questions[examCurrentPage] ? (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
                    {takingExam.questions[examCurrentPage].question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(takingExam.questions[examCurrentPage].options || []).map((option: string, idx: number) => (
                    <Button
                      key={idx}
                      variant="outline"
                      disabled={lockedQuestions.has(examCurrentPage) || examResult !== null || isTimeUp}
                      className={`h-auto p-5 justify-start text-left bg-white border-slate-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group ${studentAnswers[examCurrentPage] === idx ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : ''} ${lockedQuestions.has(examCurrentPage) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        setStudentAnswers({
                          ...studentAnswers,
                          [examCurrentPage]: idx
                        });
                      }}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${studentAnswers[examCurrentPage] === idx ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`font-semibold transition-colors ${studentAnswers[examCurrentPage] === idx ? 'text-primary' : 'text-slate-700 group-hover:text-primary'}`}>{option}</span>
                        {studentAnswers[examCurrentPage] === idx && (
                          <div className="ml-auto bg-primary/10 p-1.5 rounded-full">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full flex-col gap-4 text-slate-400">
                <Spinner className="size-8" />
                <p className="font-bold">Loading questions...</p>
              </div>
            )}
          </div>

          <DialogHeader className="p-8 pt-4 border-t bg-white relative z-10">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex justify-start min-w-[100px] shrink-0">
                {!examResult && (
                  <Button
                    variant="ghost"
                    className="rounded-full px-4 h-11 font-bold text-rose-500 hover:bg-rose-50 transition-all"
                    onClick={() => {
                      setTakingExam(null);
                      setExamCurrentPage(0);
                      setStudentAnswers({});
                      setVisitedQuestions(new Set());
                      setExamResult(null);
                      setExamTimeLeft(null);
                      setPerQuestionTimeLeft({});
                      setLockedQuestions(new Set());
                      setIsTimeUp(false);
                      toast.info("Exam cancelled.");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div className="flex flex-1 justify-center items-center gap-2 max-w-xl mx-auto overflow-hidden">
                <Button
                  variant="outline"
                  className="rounded-full px-3 h-10 border-slate-100 text-slate-500 font-bold hover:text-primary hover:border-primary/30 shrink-0 text-xs"
                  onClick={() => setPaginationStart(prev => Math.max(0, prev - 5))}
                  disabled={paginationStart === 0}
                >
                  Previous
                </Button>

                <div className="flex gap-1.5 items-center">
                  {takingExam?.questions?.slice(paginationStart, paginationStart + 5).map((_: any, i: number) => {
                    const idx = paginationStart + i;
                    const hasAnswer = studentAnswers[idx] !== undefined;
                    const isVisited = visitedQuestions.has(idx);
                    const isActive = idx === examCurrentPage;

                    let buttonStyles = "bg-white text-slate-400 border-slate-100 hover:border-primary/30";

                    if (isActive) {
                      buttonStyles = "bg-primary text-white shadow-lg shadow-primary/20 scale-110 border-primary";
                    } else if (hasAnswer) {
                      buttonStyles = "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100 hover:bg-emerald-600";
                    } else if (isVisited) {
                      buttonStyles = "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100 hover:bg-rose-600";
                    }

                    return (
                      <Button
                        key={idx}
                        variant={isActive ? "default" : "outline"}
                        size="icon"
                        className={`h-9 w-9 rounded-xl font-bold transition-all duration-300 shrink-0 ${buttonStyles}`}
                        onClick={() => setExamCurrentPage(idx)}
                      >
                        {idx + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  className="rounded-full px-3 h-10 border-slate-100 text-slate-500 font-bold hover:text-primary hover:border-primary/30 shrink-0 text-xs"
                  onClick={() => setPaginationStart(prev => Math.min((takingExam?.questions?.length || 5) - 5, prev + 5))}
                  disabled={paginationStart + 5 >= (takingExam?.questions?.length || 0)}
                >
                  Next
                </Button>
              </div>

              <div className="flex justify-end min-w-[120px] shrink-0">
                {!examResult && (
                  <Button
                    className="rounded-full px-6 h-11 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 text-sm"
                    onClick={handleSubmitExam}
                  >
                    Submit Exam
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}