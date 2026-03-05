import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import AppHeader from "./AppHeader";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, FileUp, Sparkles, CheckCircle2, MoreVertical, Download, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateExamPDF } from "../lib/pdf-generator";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

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

  // const [exams, setExams] = useState<Exam[]>([]);

  // useEffect(() => {
  //   const published = JSON.parse(localStorage.getItem("published_exams") || "[]");
  //   setExams(published);
  // }, []);

  // 🔥 FETCH EXAMS FROM BACKEND
  const fetchExams = async () => {
    try {
      setLoading(true);

      const res = await apiRequest("GET", "/api/exams");
      const data = await res.json();

      if (data.success) {
        setExams(data.data);   // Backend exams
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

  const handleDownloadPDF = async (e: React.MouseEvent, exam: Exam) => {
    e.stopPropagation();
    try {
      const res = await apiRequest("GET", `/api/exams/${exam._id}/questions`);
      const data = await res.json();

      if (data.success && data.data) {
        generateExamPDF({ ...exam, questions: data.data });
      } else {
        generateExamPDF(exam);
      }
    } catch (error) {
      console.error("Error fetching questions for PDF:", error);
      generateExamPDF(exam);
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

  if (loading) return <div>Loading exams...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-inter">
      <AppHeader />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back, {user?.name || "Guest"} 👋</h1>
            <p className="text-slate-500 font-medium">Here's an overview of your recent exams and generations.</p>
          </div>
          <Button
            size="lg"
            className="rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2 px-6 active:scale-95"
            onClick={() => setLocation("/create-exam")}
            data-testid="button-create-exam"
          >
            <Plus className="h-5 w-5" />
            Create New Exam
          </Button>
        </div>

        {/* Quick Actions / Stats */}
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

        {/* Recent Exams */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Exams</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full">
              View all
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam._id} className="border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-3xl group cursor-pointer bg-white overflow-hidden relative" data-testid={`card-exam-${exam.id}`}>
                <CardHeader className="pb-3 px-6 pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className={`rounded-full px-3 py-1 font-semibold text-[10px] uppercase tracking-wider border-0 ${exam.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {exam.status}
                    </Badge>

                    {/* Three-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus-visible:ring-0">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl p-1 w-48">
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg text-slate-600 hover:text-primary transition-colors focus:bg-primary/5 focus:text-primary"
                          onClick={(e) => handleDownloadPDF(e, exam)}
                        >
                          <Download className="h-4 w-4" />
                          <span className="font-medium">Download as PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg text-rose-600 hover:bg-rose-50 transition-colors focus:bg-rose-50 focus:text-rose-700"
                          onClick={() => deleteMutation.mutate(exam._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="font-medium">Delete Exam</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors mb-1">{exam.title}</CardTitle>
                  <CardDescription className="text-base font-semibold text-blue-500/80">{exam.subject}</CardDescription>
                </CardHeader>
                <CardContent className="pb-8 px-6">
                  <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>{exam.questionsCount ?? (Array.isArray(exam.questions) ? exam.questions.length : Array.isArray(exam.questionData) ? exam.questionData.length : typeof exam.questions === 'number' ? exam.questions : 0)} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{exam.date || (exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : '')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Placeholder Card */}
            <Card className="border-dashed border-2 border-slate-200 shadow-none hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 rounded-xl flex flex-col items-center justify-center min-h-[200px] cursor-pointer group" data-testid="card-create-exam">
              <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-slate-700 group-hover:text-primary transition-colors">Start a new draft</p>
              <p className="text-sm text-slate-500 mt-1">Upload materials to begin</p>
            </Card>
          </div>
        </div>
      </main>
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