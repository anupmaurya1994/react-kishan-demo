import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, FileUp, Sparkles, CheckCircle2, MoreVertical, Download, Trash2, Zap, Award, Tags, Pencil, ChevronLeft, ChevronRight, Calendar, Filter, User, Trophy, AlertCircle } from "lucide-react";
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
  DialogDescription,
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function PerformanceGraph({ data, title, description, type = "teacher" }: any) {
  const displayData = data.length === 0 ? (
    type === "teacher" ? [
      { name: 'Mon', questions: 20 },
      { name: 'Tue', questions: 50 },
      { name: 'Wed', questions: 35 },
      { name: 'Thu', questions: 80 },
      { name: 'Fri', questions: 45 },
    ] : [
      { name: 'Week 1', points: 65 },
      { name: 'Week 2', points: 72 },
      { name: 'Week 3', points: 85 },
      { name: 'Week 4', points: 90 },
    ]
  ) : (data.length === 1 ? [{ name: 'Start', [type === "teacher" ? "questions" : "points"]: 0 }, ...data] : data);

  const dataKey = type === "teacher" ? "questions" : "points";
  const color = type === "teacher" ? "#4f46e5" : "#8b5cf6";
  const gradientId = `color${dataKey}`;

  return (
    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-2xl">
      <CardHeader className="border-b border-slate-100/50 p-8 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">{title}</CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-1">{description}</CardDescription>
        </div>
        {type === "student" && data.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Current Performance
          </div>
        )}
      </CardHeader>
      <CardContent className="p-8 sm:px-10 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600, fontSize: 13 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 13 }} dx={-10} />
            <RechartsTooltip
              contentStyle={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '16px 20px', fontWeight: 'bold', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}
              itemStyle={{ color: color }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={5} fillOpacity={1} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function StudentAnalyticsDashboard({ exams, user, setLocation }: any) {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<"weekly" | "monthly" | "overall">("overall");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLeaderboardLoading(true);
        const res = await apiRequest("GET", `/api/exams/leaderboard?timeframe=${leaderboardTimeframe}`);
        const data = await res.json();
        if (data.success) {
          setLeaderboardData(data.data);
        }
      } catch (err) {
        console.error("Leaderboard fetch failed", err);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchLeaderboard();
  }, [leaderboardTimeframe]);

  const completedExams = exams.filter((e: any) => e.isCompleted);
  const pendingExams = exams.filter((e: any) => !e.isCompleted);

  const avgScore = completedExams.length > 0
    ? Math.round(completedExams.reduce((acc: number, e: any) => acc + (e.percentage || 0), 0) / completedExams.length)
    : 0;

  // Chart data: Average Score grouped by Month (Last 12 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize with last 12 months
  const last12MonthsData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1); // Set to 1st to avoid rollover bugs (e.g., Mar 31 -> Feb 31 rolls to Mar)
    d.setMonth(d.getMonth() - (11 - i));
    return { 
      name: monthNames[d.getMonth()], 
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      points: 0 
    };
  });

  const chartData = completedExams.reduce((acc: any[], exam: any) => {
    const date = new Date(exam.createdAt || Date.now());
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    // Use exam.score to match the exact Points (PTS) logic used by the Leaderboard
    const points = exam.score || 0;
    
    const existing = acc.find(item => item.name === month && item.year === year);
    if (existing) {
      existing.points += points;
    }
    return acc;
  }, last12MonthsData).map(item => ({
    name: item.name,
    points: item.points
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 relative z-10 w-full max-w-7xl mx-auto">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-100px] left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">{user?.name}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium text-lg">Here's your learning progress and performance.</p>
        </div>
        <Button
          onClick={() => setLocation('/exams')}
          className="rounded-2xl h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-primary to-indigo-600 border-0 text-white"
        >
          <FileText className="mr-2 h-5 w-5" />
          Start Practicing
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PerformanceGraph 
            data={chartData} 
            type="student" 
            title="Annual Points Trend" 
            description="Points earned month-by-month over the past year" 
          />
        </div>

        {/* Global Leaderboard Widget */}
        <Card className="lg:col-span-1 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-2xl flex flex-col lg:h-[575px]">
          <CardHeader className="border-b border-slate-100/50 p-6 bg-white/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 p-3.5 rounded-2xl shadow-sm border border-amber-200/50">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Leaderboard</CardTitle>
                </div>
              </div>
              <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 backdrop-blur-sm w-[180px] sm:w-auto">
                <button
                  onClick={() => setLeaderboardTimeframe("weekly")}
                  className={`flex-1 px-1 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-tighter transition-all ${leaderboardTimeframe === "weekly" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setLeaderboardTimeframe("monthly")}
                  className={`flex-1 px-1 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-tighter transition-all ${leaderboardTimeframe === "monthly" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setLeaderboardTimeframe("overall")}
                  className={`flex-1 px-1 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-tighter transition-all ${leaderboardTimeframe === "overall" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Overall
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {leaderboardLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-3 animate-pulse gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-24" />
                      <div className="h-2 bg-slate-50 rounded w-16" />
                    </div>
                  </div>
                ))
              ) : leaderboardData?.length > 0 ? (
                leaderboardData.slice(0, 7).map((student: any) => (
                  <div key={student.rank} className={`flex items-center p-3 rounded-2xl transition-all ${student.studentId === (user as any)?._id ? 'bg-primary/5 border border-primary/20 shadow-[0_4px_15px_-5px_rgba(79,70,229,0.15)] relative overflow-hidden' : 'bg-slate-50/50 border border-transparent hover:bg-slate-50 hover:shadow-sm'}`}>
                    {student.studentId === (user as any)?._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"></div>}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mr-4 ${student.rank === 1 ? 'bg-amber-100 text-amber-600' : student.rank === 2 ? 'bg-slate-200 text-slate-600' : student.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-transparent text-slate-400'}`}>
                      #{student.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${student.studentId === (user as any)?._id ? 'text-primary' : 'text-slate-700'}`}>{student.name} {student.studentId === (user as any)?._id && <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full ml-1 uppercase">Me</span>}</p>
                    </div>
                    <div className="text-right pl-2">
                      <p className={`font-black text-sm ${student.studentId === (user as any)?._id ? 'text-primary' : 'text-slate-900'}`}>{Math.round(student.totalPoints).toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PTS</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                  <Trophy className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">No activity yet</p>
                </div>
              )}
            </div>
            <div className="p-4 pt-2 border-t border-slate-100/50 bg-white/50 backdrop-blur-md">
              <Button
                variant="outline"
                className="w-full rounded-xl border-slate-200 font-bold text-slate-600 hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
                onClick={() => setLocation("/leaderboard")}
              >
                View Full Rankings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function TeacherAnalyticsDashboard({ exams, user, setLocation }: any) {
  const publishedExams = exams.filter((e: any) => e.status?.toUpperCase() === 'PUBLISHED');
  const draftExams = exams.filter((e: any) => e.status?.toUpperCase() !== 'PUBLISHED');
  const totalQuestions = exams.reduce((acc: number, e: any) => acc + (e.questionsCount || e.questions?.length || 0), 0);

  // Chart data: Total Questions Generated grouped by Month (Last 12 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize with last 12 months
  const last12MonthsData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1); // Avoid month rollover
    d.setMonth(d.getMonth() - (11 - i));
    return { 
      name: monthNames[d.getMonth()], 
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      questions: 0 
    };
  });

  const chartData = exams.reduce((acc: any[], exam: any) => {
    const date = new Date(exam.createdAt || Date.now());
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const qCount = exam.questionsCount || exam.questions?.length || 0;
    
    const existing = acc.find(item => item.name === month && item.year === year);
    if (existing) {
      existing.questions += qCount;
    }
    return acc;
  }, last12MonthsData);

  // Difficulty Distribution Data
  const difficultyCounts = exams.reduce((acc: any, exam: any) => {
    const diff = (exam.difficulty || "Medium").toLowerCase();
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, { easy: 0, medium: 0, hard: 0 });

  const difficultyData = [
    { name: 'Easy', value: difficultyCounts.easy, color: '#10b981' },
    { name: 'Medium', value: difficultyCounts.medium, color: '#3b82f6' },
    { name: 'Hard', value: difficultyCounts.hard, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-black">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 relative z-10 w-full max-w-7xl mx-auto">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-100px] left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
            Teacher Dashboard, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">{user?.name}</span> 🎓
          </h1>
          <p className="text-slate-500 font-medium text-lg">Manage your exams and track generation progress.</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setLocation('/exam-lists')}
            variant="outline"
            className="rounded-2xl h-14 px-8 text-base font-bold border-slate-200 hover:bg-slate-50 transition-all duration-300"
          >
            <FileText className="mr-2 h-5 w-5" />
            View All Exams
          </Button>
          <Button
            onClick={() => setLocation('/create-exam')}
            className="rounded-2xl h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-primary to-indigo-600 border-0 text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Exam
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative">
          <PerformanceGraph 
            data={chartData} 
            type="teacher" 
            title="Annual Generation Trend" 
            description="Monthly breakdown of total questions generated over the past year" 
          />
        </div>

        {/* Difficulty Distribution Pie Chart */}
        <Card className="lg:col-span-1 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-2xl flex flex-col p-8">
          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mb-2">Difficulty Split</CardTitle>
          <CardDescription className="text-slate-500 font-medium mb-4">Exam distribution by level</CardDescription>
          
          <div className="flex-1 h-[250px] min-h-[250px]">
            {difficultyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={4}
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    content={({ payload }) => (
                      <div className="flex justify-center gap-4 mt-4">
                        {payload?.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-12 h-12 opacity-10 mb-2" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-30">No data available</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              <span>Difficulty</span>
              <span>Count</span>
            </div>
            <div className="space-y-2">
              {['Easy', 'Medium', 'Hard'].map(level => (
                <div key={level} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${level === 'Easy' ? 'bg-emerald-500' : level === 'Medium' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                    <span className="text-sm font-bold text-slate-700">{level}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{difficultyCounts[level.toLowerCase()] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
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
  const [examLeaderboardDialog, setExamLeaderboardDialog] = useState<any>(null);
  const [examLeaderboardData, setExamLeaderboardData] = useState<any[]>([]);
  const [examLeaderboardLoading, setExamLeaderboardLoading] = useState(false);
  const [confirmCancelExam, setConfirmCancelExam] = useState(false);

  const handleViewExamLeaderboard = async (e: React.MouseEvent, exam: any) => {
    e.stopPropagation();
    setExamLeaderboardDialog(exam);
    setExamLeaderboardLoading(true);
    try {
      const res = await apiRequest("GET", `/api/exams/${exam._id}/leaderboard`);
      const data = await res.json();
      if (data.success) {
        setExamLeaderboardData(data.data);
      }
    } catch (err) {
      toast.error("Failed to load exam leaderboard");
    } finally {
      setExamLeaderboardLoading(false);
    }
  };

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
  const [showBigCelebration, setShowBigCelebration] = useState(false);

  useEffect(() => {
    if (examResult) {
      setShowBigCelebration(true);
      const timer = setTimeout(() => setShowBigCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [examResult]);
  const [paginationStart, setPaginationStart] = useState(0);
  const [examTimeLeft, setExamTimeLeft] = useState<number | null>(null);
  const [perQuestionTimeLeft, setPerQuestionTimeLeft] = useState<Record<number, number>>({});
  const [lockedQuestions, setLockedQuestions] = useState<Set<number>>(new Set());
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [examFilter, setExamFilter] = useState<'all' | 'completed' | 'not_completed'>(
    (localStorage.getItem('dashboard_exam_filter') as any) || 'all'
  );

  useEffect(() => {
    localStorage.setItem('dashboard_exam_filter', examFilter);
  }, [examFilter]);

  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>(
    (localStorage.getItem('dashboard_difficulty_filter') as any) || 'all'
  );

  const [viewingResult, setViewingResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem('dashboard_difficulty_filter', difficultyFilter);
  }, [difficultyFilter]);
  const pageSize = 6;

  const filteredExams = exams.filter(exam => {
    if (difficultyFilter !== 'all') {
      if ((exam as any).difficulty?.toLowerCase() !== difficultyFilter.toLowerCase()) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (exam.title || "").toLowerCase();
      const subject = (exam.subject || "").toLowerCase();
      if (!title.includes(q) && !subject.includes(q)) return false;
    }

    if (user?.role === "student") {
      if (examFilter === 'all') return true;
      if (examFilter === 'completed') return (exam as any).isCompleted;
      if (examFilter === 'not_completed') return !(exam as any).isCompleted;
    }

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
        setExams(data.data);
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

  const handleSubmitExam = async () => {
    if (!takingExam) return;
    const questions = takingExam.questions;
    let correctCount = 0;

    // Format answers for backend submission
    const answers = questions.map((q: any, idx: number) => ({
      questionId: q.questionId || q._id,
      selectedOption: studentAnswers[idx]
    })).filter(a => a.selectedOption !== undefined);

    questions.forEach((q: any, idx: number) => {
      const studentAns = studentAnswers[idx];
      const correctAns = q.correctAnswer;
      if (studentAns !== undefined && Number(studentAns) === Number(correctAns)) {
        correctCount++;
      }
    });

    const limit = takingExam.timeLimit || (takingExam as any).duration || 60;
    let timeTakenSeconds = 0;
    let avgTimePerQuestion = 0;

    if (takingExam.timeLimitType === "per-question") {
      const totalSecondsSpent = Object.values(perQuestionTimeLeft).reduce((acc, left) => acc + (limit * 60 - left), 0);
      timeTakenSeconds = totalSecondsSpent;
      avgTimePerQuestion = questions.length > 0 ? totalSecondsSpent / questions.length : 0;
    } else {
      timeTakenSeconds = (limit * 60) - (examTimeLeft || 0);
      avgTimePerQuestion = questions.length > 0 ? timeTakenSeconds / questions.length : 0;
    }

    const totalQuestions = questions.length;
    const attemptedCount = Object.keys(studentAnswers).length;
    const notAttemptedCount = totalQuestions - attemptedCount;
    const wrongCount = attemptedCount - correctCount;

    if (user?.role === "student") {
      try {
        const res = await apiRequest("POST", "/api/exams/student/submit", {
          examId: takingExam._id,
          answers: answers,
          timeTaken: timeTakenSeconds,
          avgTimePerQuestion: avgTimePerQuestion,
          stats: {
            totalQuestions,
            attemptedCount,
            correctCount,
            wrongCount
          }
        });
        const data = await res.json();

        // Check for improvement
        const previousExamData = exams.find(e => e._id === takingExam._id);
        const previousPercentage = previousExamData?.percentage || 0;
        const isBetterThanLast = ((correctCount / questions.length) * 100) > previousPercentage;

        if (!data.success) {
          toast.error(data.message || "Failed to submit exam to server");
        } else {
          // Update local state to reflect completion
          setExams(prev => prev.map(e =>
            e._id === takingExam._id ? {
              ...e,
              isCompleted: true,
              score: correctCount,
              totalMarks: questions.length,
              percentage: (correctCount / questions.length) * 100,
              timeTaken: timeTakenSeconds,
              avgTimePerQuestion: avgTimePerQuestion,
              totalQuestions,
              attemptedCount,
              correctCount,
              wrongCount
            } : e
          ));
        }
      } catch (error) {
        console.error("Submission failed:", error);
        toast.error("Network error submitting exam. Please try again.");
      }
    }

    setExamResult({
      total: questions.length,
      score: correctCount,
      percentage: (correctCount / questions.length) * 100,
      timeTaken: timeTakenSeconds,
      avgTime: avgTimePerQuestion,
      isBetterThanLast: (user?.role === "student") ? (((correctCount / questions.length) * 100) > (exams.find(e => e._id === takingExam._id)?.percentage || 0)) : false,
      isPerQuestion: takingExam.timeLimitType === "per-question",
      stats: {
        totalQuestions,
        attemptedCount,
        notAttemptedCount,
        correctCount,
        wrongCount
      }
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

  const deleteExamMutation = useMutation({
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

  const handleDeleteExam = () => {
    if (examToDelete) {
      deleteExamMutation.mutate(examToDelete._id);
      setExamToDelete(null);
    }
  };

  const handleStartExam = async (exam: any) => {
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
  };

  return (
    <>
      <div className="bg-slate-50/50 flex flex-col">
      {loading ? (
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 flex flex-col items-center border border-slate-100">
            <Spinner className="size-16 text-primary" />
            <p className="mt-6 text-slate-900 font-extrabold text-xl animate-pulse">Fetching your exams...</p>
            <p className="mt-2 text-slate-400 font-medium italic">Just a moment while we load everything.</p>
          </div>
        </main>
      ) : (
        /* Main Content */
        <main className={`flex-1 container mx-auto px-4 ${(location === "/exams" || location === "/exam-lists") ? "py-4" : "py-8"}`}>
          {location === "/dashboard" ? (
            user?.role === "student" ? (
              <StudentAnalyticsDashboard exams={exams} user={user} setLocation={setLocation} />
            ) : (
              <TeacherAnalyticsDashboard exams={exams} user={user} setLocation={setLocation} />
            )
          ) : (
            <>
              {/* Welcome header — only on list pages */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    {location === "/exams" ? "Student Exam Portal" : "Manage Your Exams"}
                  </h1>
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
              {/* Stat Cards (Shifted here from Dashboard) */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                {user?.role === "student" ? (
                  <>
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                          <Award className="w-5 h-5" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Avg Score</p>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{Math.round(exams.filter(e => e.isCompleted).reduce((acc, e) => acc + (e.percentage || 0), 0) / (exams.filter(e => e.isCompleted).length || 1))}%</h2>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Completed</p>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{exams.filter(e => e.isCompleted).length}</h2>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
                          <Clock className="w-5 h-5" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Pending</p>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{exams.filter(e => !e.isCompleted).length}</h2>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Exams</p>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{exams.length}</h2>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Published</p>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{exams.filter((e: any) => e.status?.toUpperCase() === 'PUBLISHED').length}</h2>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
                          <Pencil className="w-5 h-5" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Drafts</p>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{exams.filter((e: any) => e.status?.toUpperCase() !== 'PUBLISHED').length}</h2>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Questions</p>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{exams.reduce((acc: number, e: any) => acc + (e.questionsCount || e.questions?.length || 0), 0)}</h2>
                    </motion.div>
                  </>
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

              {/* Integrated Dashboard Graph (Shifted here from Analytics) */}
              {!(user?.role === "student" && (location === "/exams" || location === "/exam-lists")) && (
                <div className="mb-10">
                  {user?.role === "student" ? (
                  <PerformanceGraph 
                    data={(() => {
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const last12Months = Array.from({ length: 12 }, (_, i) => {
                        const d = new Date();
                        d.setDate(1); // Avoid rollover
                        d.setMonth(d.getMonth() - (11 - i));
                        return { name: monthNames[d.getMonth()], year: d.getFullYear(), points: 0 };
                      });
                      const completed = exams.filter((e: any) => e.isCompleted);
                      return completed.reduce((acc: any[], exam: any) => {
                        const date = new Date(exam.createdAt || Date.now());
                        const month = monthNames[date.getMonth()];
                        const year = date.getFullYear();
                        const pts = exam.points || Math.round((exam.percentage || 0) / 10);
                        const existing = acc.find(item => item.name === month && item.year === year);
                        if (existing) {
                          existing.points += pts;
                        }
                        return acc;
                      }, last12Months);
                    })()} 
                    type="student" 
                    title="Annual Points Trend" 
                    description="Points earned month-by-month over the past year" 
                  />
                ) : (
                  <PerformanceGraph 
                    data={(() => {
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const last12Months = Array.from({ length: 12 }, (_, i) => {
                        const d = new Date();
                        d.setDate(1); // Avoid rollover
                        d.setMonth(d.getMonth() - (11 - i));
                        return { name: monthNames[d.getMonth()], year: d.getFullYear(), questions: 0 };
                      });
                      return exams.reduce((acc: any[], exam: any) => {
                        const date = new Date(exam.createdAt || Date.now());
                        const month = monthNames[date.getMonth()];
                        const year = date.getFullYear();
                        const qCount = exam.questionsCount || exam.questions?.length || 0;
                        const existing = acc.find(item => item.name === month && item.year === year);
                        if (existing) { existing.questions += qCount; }
                        return acc;
                      }, last12Months);
                    })()} 
                    type="teacher" 
                    title="Annual Generation Trend" 
                    description="Monthly breakdown of total questions generated over the past year" 
                  />
                )}
              </div>
            )}

            {/* Recent Exams Section */}
              <div className={(location === "/exams" || location === "/exam-lists") ? "mt-0" : "mt-12"}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-4">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {(location === "/exams" || location === "/exam-lists") ? "All Exams" : "Recent Exams"}
                  </h2>
                </div>

                {/* Search bar — only on list pages */}
                {(location === "/exams" || location === "/exam-lists") && (
                  <div className="relative mb-4">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input
                      type="text"
                      placeholder="Search exams by title or subject..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3 w-full z-10 mb-5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="rounded-xl font-bold text-slate-600 border-slate-200/50 bg-white shadow-sm h-[44px] px-5 w-full sm:w-auto flex items-center justify-center">
                        <Filter className="w-4 h-4 mr-2" />
                        {difficultyFilter === 'all' ? 'All Difficulties' : difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 w-48 bg-white">
                      <DropdownMenuItem className={`px-4 py-3 cursor-pointer rounded-xl transition-colors font-medium ${difficultyFilter === 'all' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`} onClick={() => { setDifficultyFilter('all'); setCurrentPage(1); }}>
                        All Difficulties
                      </DropdownMenuItem>
                      <DropdownMenuItem className={`px-4 py-3 cursor-pointer rounded-xl transition-colors font-medium ${difficultyFilter === 'easy' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'}`} onClick={() => { setDifficultyFilter('easy'); setCurrentPage(1); }}>
                        Easy
                      </DropdownMenuItem>
                      <DropdownMenuItem className={`px-4 py-3 cursor-pointer rounded-xl transition-colors font-medium ${difficultyFilter === 'medium' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`} onClick={() => { setDifficultyFilter('medium'); setCurrentPage(1); }}>
                        Medium
                      </DropdownMenuItem>
                      <DropdownMenuItem className={`px-4 py-3 cursor-pointer rounded-xl transition-colors font-medium ${difficultyFilter === 'hard' ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'}`} onClick={() => { setDifficultyFilter('hard'); setCurrentPage(1); }}>
                        Hard
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {user?.role === "student" && (
                    <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl w-full sm:w-auto border border-slate-200/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-xl px-5 py-2 font-bold transition-all duration-300 ${examFilter === 'all' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-primary hover:bg-white/50'}`}
                        onClick={() => {
                          setExamFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-xl px-5 py-2 font-bold transition-all duration-300 ${examFilter === 'not_completed' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'}`}
                        onClick={() => {
                          setExamFilter('not_completed');
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
                    <motion.div
                      key={exam._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="h-full flex flex-col"
                    >
                      <Card
                        className="border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 rounded-3xl group cursor-pointer bg-white overflow-hidden relative flex-1 flex flex-col"
                        data-testid={`card-exam-${exam.id}`}
                        onClick={async () => {
                          if (user?.role === "student") {
                            if ((exam as any).isCompleted) {
                              setViewingResult(exam);
                            } else {
                              setPreviewExam(exam);
                            }
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
                          exam.difficulty?.toUpperCase() === 'MEDIUM' ? 'bg-blue-500' :
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
                                  ? ((exam as any).isCompleted
                                    ? `Completed • ${Math.round((exam as any).percentage || 0)}%`
                                    : 'Not Completed')
                                  : (exam.status || 'Draft')}
                              </Badge>
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
                                {(exam as any).isCompleted && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full bg-slate-50 hover:bg-amber-100 hover:text-amber-600 transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => handleViewExamLeaderboard(e, exam)}
                                    title="View Leaderboard"
                                  >
                                    <Trophy className="h-4 w-4" />
                                  </Button>
                                )}
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
                              {user?.role === "student" && (exam as any).isCompleted ? (
                                <div className="flex items-center gap-2">
                                  <div className="bg-white p-1.5 rounded-md shadow-sm border border-emerald-100">
                                    <Award className="h-3.5 w-3.5 text-emerald-500" />
                                  </div>
                                  <span className="text-emerald-700 font-bold">{(exam as any).correctCount || (exam as any).score || 0} / {(exam as any).totalQuestions || (exam as any).questionsCount || (exam as any).questions?.length || 0} Que</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                                    <Award className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span>{(exam as any).questionsCount || (exam as any).questions?.length || (exam as any).totalQuestions || 0} Questions</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>{exam.timeLimit || (exam as any).duration || 60} mins</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                                  <Zap className={`h-3.5 w-3.5 ${(exam as any).difficulty?.toUpperCase() === 'HARD' ? 'text-rose-500' :
                                    (exam as any).difficulty?.toUpperCase() === 'MEDIUM' ? 'text-blue-500' :
                                      (exam as any).difficulty?.toUpperCase() === 'EASY' ? 'text-emerald-500' :
                                        'text-amber-500'
                                    }`} />
                                </div>
                                <span className="capitalize">{(exam as any).difficulty || "Medium"}</span>
                              </div>
                            </div>

                            {/* Secondary Stats Row (Completed Students Only) */}
                            {user?.role === "student" && (exam as any).isCompleted && (
                              <div className="grid grid-cols-4 gap-2 pt-1">
                                <div className="flex flex-col p-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50 items-center justify-center">
                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter leading-none">Right</span>
                                  <span className="text-xs font-black text-emerald-700 mt-0.5">{(exam as any).correctCount || (exam as any).score || 0}</span>
                                </div>
                                <div className="flex flex-col p-2 bg-rose-50/50 rounded-xl border border-rose-100/50 items-center justify-center">
                                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter leading-none">Wrong</span>
                                  <span className="text-xs font-black text-rose-700 mt-0.5">{(exam as any).wrongCount || 0}</span>
                                </div>
                                <div className="flex flex-col p-2 bg-amber-50/50 rounded-xl border border-amber-100/50 items-center justify-center">
                                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter leading-none">Skip</span>
                                  <span className="text-xs font-black text-amber-700 mt-0.5">{Math.max(0, ((exam as any).totalQuestions || (exam as any).questionsCount || (exam as any).questions?.length || 0) - ((exam as any).attemptedCount || 0))}</span>
                                </div>
                                <div className="flex flex-col p-2 bg-slate-50/50 rounded-xl border border-slate-100/50 items-center justify-center">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none">Time</span>
                                  <span className="text-[10px] font-black text-slate-600 mt-0.5">{(exam as any).timeTaken ? `${Math.floor((exam as any).timeTaken / 60)}m` : 'N/A'}</span>
                                </div>
                              </div>
                            )}

                            {/* Secondary Details */}
                            <div className="space-y-3 px-1">
                              <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
                                <Award className="h-3.5 w-3.5 text-indigo-400" />
                                <span className="truncate">Type: <span className="text-slate-600 font-bold capitalize">{(exam as any).timeLimitType || "Overall"}</span></span>
                              </div>

                              <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
                                <FileText className="h-3.5 w-3.5 text-rose-400" />
                                <span className="truncate">Subject: <span className="text-slate-600 font-bold capitalize">{exam.subject || (exam as any).subjects?.[0] || (exam as any).examId?.subject || "General"}</span></span>
                              </div>

                              <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
                                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                                <span className="truncate">Published: <span className="text-slate-600 font-bold">{new Date(exam.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></span>
                              </div>

                              {user?.role === "student" && (exam as any).createdBy && (
                                <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
                                  <User className="h-3.5 w-3.5 text-amber-400" />
                                  <span className="truncate">Teacher: <span className="text-slate-600 font-bold">{(exam as any).createdBy.firstName} {(exam as any).createdBy.lastName}</span></span>
                                </div>
                              )}

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
                    </motion.div>
                  ))}

                  {filteredExams.length === 0 && (
                    <div
                      className="lg:col-span-3 md:col-span-2 py-16 flex flex-col items-center justify-center bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
                      onClick={() => {
                        if (user?.role !== "student") {
                          sessionStorage.removeItem("current_exam_data");
                          sessionStorage.removeItem("isEditingExam");
                          setLocation("/create-exam");
                        }
                      }}
                    >
                      <div className="bg-primary/10 p-6 rounded-full mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                        {examFilter === 'completed' ? (
                          <Award className="h-10 w-10 text-primary" />
                        ) : (
                          <Plus className="h-10 w-10 text-primary" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 group-hover:text-primary transition-colors">
                        {exams.length === 0
                          ? "No exams found"
                          : examFilter === 'completed'
                            ? "No completed exams"
                            : "No matching exams"}
                      </h3>
                      <p className="text-slate-500 mt-2 font-medium text-center px-4 max-w-md">
                        {exams.length === 0
                          ? (user?.role === "student" ? "No exams have been published yet. Check back soon!" : "You haven't created any exams yet.")
                          : examFilter === 'completed'
                            ? "You have not completed any exam. Please take an exam or complete your pending exams to see them here."
                            : "No exams match your current filters. Try adjusting your search or filter settings."}
                      </p>


                      {user?.role !== "student" ? (
                        <Button
                          variant="outline"
                          className="mt-8 rounded-full px-8 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          Create Your First Exam
                        </Button>
                      ) : (
                        (examFilter !== 'all' || difficultyFilter !== 'all') && (
                          <Button
                            variant="outline"
                            className="mt-8 rounded-full px-8 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExamFilter('all');
                              setDifficultyFilter('all');
                            }}
                          >
                            Reset All Filters
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Pagination Footer */}
                {filteredExams.length > pageSize && (
                  <div className="mt-10 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-medium text-slate-500">
                        Showing <span className="text-primary font-bold">{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredExams.length)}</span> of <span className="text-primary font-bold">{filteredExams.length}</span> exams
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
            </>
          )}
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
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200"
              onClick={handleDeleteExam}
              disabled={deleteExamMutation.isPending}
            >
              {deleteExamMutation.isPending ? "Deleting..." : "Delete Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Exam Confirmation Modal */}
      <AlertDialog open={confirmCancelExam} onOpenChange={setConfirmCancelExam}>
        <AlertDialogContent className="rounded-[2rem] border-0 p-8 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center text-slate-900">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 text-base font-medium mt-2">
              Are you sure you want to quit the exam? Your progress will be lost and this attempt will not be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 sm:justify-center flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="mt-0 sm:mt-0 w-full rounded-2xl h-12 font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
              Continue Exam
            </AlertDialogCancel>
            <AlertDialogAction
              className="w-full rounded-2xl h-12 font-bold bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20 border-0"
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
                setConfirmCancelExam(false);
                toast.info("Exam cancelled.");
              }}
            >
              Quit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exam Leaderboard Dialog */}
      <Dialog open={!!examLeaderboardDialog} onOpenChange={(open) => !open && setExamLeaderboardDialog(null)}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-3xl border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-0 overflow-hidden rounded-[2.5rem]">
          <DialogHeader className="p-8 pb-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-4 rounded-2xl shadow-sm border border-amber-200/50">
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                  Exam Leaderboard
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2">
                  <span className="truncate max-w-[250px] font-bold text-slate-700">{examLeaderboardDialog?.title}</span> • Rankings based on score & speed
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
            {examLeaderboardLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Spinner className="w-10 h-10 text-primary" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Rankings...</p>
              </div>
            ) : examLeaderboardData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Trophy className="w-12 h-12 opacity-20 mb-4" />
                <p className="font-bold uppercase tracking-widest text-sm">No attempts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-6">Student</div>
                  <div className="col-span-2 text-center">Time</div>
                  <div className="col-span-3 text-right">Points</div>
                </div>
                
                {examLeaderboardData.map((student: any) => {
                  const isMe = student.studentId === (user as any)?._id;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={student.studentId}
                      className={`grid grid-cols-12 gap-4 p-4 rounded-2xl items-center transition-all ${
                        isMe 
                        ? 'bg-primary/5 border border-primary/20 shadow-[0_4px_15px_-5px_rgba(79,70,229,0.15)] relative overflow-hidden' 
                        : 'bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {isMe && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>}
                      
                      <div className="col-span-1 flex justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                          student.rank === 1 ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-100 ring-offset-1' : 
                          student.rank === 2 ? 'bg-slate-200 text-slate-600 ring-2 ring-slate-100 ring-offset-1' : 
                          student.rank === 3 ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-100 ring-offset-1' : 
                          'bg-slate-50 text-slate-400'
                        }`}>
                          #{student.rank}
                        </div>
                      </div>
                      
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isMe ? 'text-primary' : 'text-slate-800'}`}>
                            {student.name}
                            {isMe && <span className="ml-2 text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md text-xs font-bold text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {Math.floor(student.timeTaken / 60)}m {student.timeTaken % 60}s
                        </div>
                      </div>
                      
                      <div className="col-span-3 text-right">
                        <p className={`font-black text-lg ${isMe ? 'text-primary' : 'text-slate-900'}`}>
                          {student.score.toLocaleString()}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PTS</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
            <Button variant="outline" className="rounded-xl font-bold" onClick={() => setExamLeaderboardDialog(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                handleStartExam(exam);
              }}
            >
              Yes, Start Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Taking Exam Modal */}
      <Dialog
        open={!!takingExam}
        onOpenChange={(open) => {
          if (!open) {
            setTakingExam(null);
            setExamCurrentPage(0);
            setStudentAnswers({});
            setVisitedQuestions(new Set());
            setExamResult(null);
            setExamTimeLeft(null);
            setPerQuestionTimeLeft({});
            setLockedQuestions(new Set());
            setIsTimeUp(false);
          }
        }}
      >
        <DialogContent
          className="max-w-3xl h-[650px] flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-2xl [&>button:last-child]:hidden"
          onInteractOutside={(e) => {
            if (!examResult) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!examResult) e.preventDefault();
          }}
        >
          <DialogHeader className={`p-8 pb-4 border-b bg-white relative z-10 ${examResult ? 'py-6' : ''}`}>
            {examResult ? (
              <div className="text-center space-y-2 w-full">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-3xl mb-1 relative">
                  {/* Floating Celebrations */}
                  <AnimatePresence>
                    {examResult.percentage >= 80 && (
                      <motion.span
                        initial={{ y: 0, opacity: 0, scale: 0.5 }}
                        animate={{ y: -40, opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                        transition={{ duration: 2 }}
                        className="absolute -top-2 -right-2 text-2xl"
                      >
                        🎉
                      </motion.span>
                    )}
                    {examResult.isBetterThanLast && (
                      <motion.span
                        initial={{ y: 0, opacity: 0, scale: 0.5 }}
                        animate={{ y: -40, opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                        transition={{ duration: 2.5 }}
                        className="absolute -top-2 -left-2 text-2xl"
                      >
                        🥳
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Main Score Emoji */}
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {examResult.percentage >= 90 ? '🏆' :
                      examResult.percentage >= 80 ? '🥇' :
                        examResult.percentage >= 70 ? '🥈' :
                          examResult.percentage >= 60 ? '🥉' :
                            examResult.percentage >= 40 ? '👍' : '📚'}
                  </motion.span>
                </div>
                <DialogTitle className="text-2xl font-black text-slate-900">Exam Complete!</DialogTitle>
                <p className="text-slate-500 text-xs font-medium">You have successfully submitted the assessment.</p>
              </div>
            ) : (
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
            )}
          </DialogHeader>

          <div className={`flex-1 p-8 bg-slate-50/50 relative ${examResult ? 'overflow-hidden flex flex-col justify-center' : 'overflow-y-auto'}`}>
            {/* Big Celebration Overlay */}
            <AnimatePresence>
              {showBigCelebration && examResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 2 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none"
                >
                  <div className="relative">
                    {examResult?.percentage >= 80 && (
                      <motion.span
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [1, 1.5, 1], rotate: [0, 10, -10, 0] }}
                        className="text-[120px] block"
                      >
                        🎉
                      </motion.span>
                    )}
                    {examResult?.isBetterThanLast && !(examResult?.percentage >= 80) && (
                      <motion.span
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [1, 1.5, 1], rotate: [0, -10, 10, 0] }}
                        className="text-[120px] block"
                      >
                        🥳
                      </motion.span>
                    )}
                    {/* If both, show them staggered or together */}
                    {examResult?.isBetterThanLast && examResult?.percentage >= 80 && (
                      <motion.span
                        initial={{ x: 50, scale: 0.5 }}
                        animate={{ x: 60, scale: [1, 1.3, 1] }}
                        className="text-[100px] absolute -top-10 -left-20"
                      >
                        🥳
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <div className="max-w-xl mx-auto py-0 space-y-3 w-full">
                <div className="text-center space-y-1 mb-2">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{takingExam?.title}</h3>
                  <div className="flex flex-col items-center gap-0.5">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">{takingExam?.subject || takingExam?.subjects?.[0]}</p>
                    {takingExam?.createdBy && (
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                        Teacher: <span className="text-slate-600 font-black">{takingExam.createdBy.firstName} {takingExam.createdBy.lastName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Score</p>
                      <p className="text-xl font-black text-primary">{examResult.score} <span className="text-slate-300 text-base">/</span> {examResult.total}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage</p>
                      <p className={`text-xl font-black ${examResult.percentage >= 40 ? 'text-emerald-500' : 'text-rose-500'}`}>{Math.round(examResult.percentage)}%</p>
                    </div>
                  </div>

                  {/* Detailed Stats Grid */}
                  <div className="grid grid-cols-5 gap-2 py-2.5 border-b border-slate-50">
                    <div className="text-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Total</p>
                      <p className="text-lg font-black text-slate-700">{examResult.stats?.totalQuestions}</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-blue-50 border border-blue-100">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tight">Attempted</p>
                      <p className="text-lg font-black text-blue-700">{examResult.stats?.attemptedCount}</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Correct</p>
                      <p className="text-lg font-black text-emerald-700">{examResult.stats?.correctCount}</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-rose-50 border border-rose-100">
                      <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tight">Incorrect</p>
                      <p className="text-lg font-black text-rose-700">{examResult.stats?.wrongCount}</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-amber-50 border border-amber-100">
                      <p className="text-[9px] font-bold text-amber-400 uppercase tracking-tight">Skipped</p>
                      <p className="text-lg font-black text-amber-700">{examResult.stats?.notAttemptedCount}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${examResult.percentage >= 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${examResult.percentage}%` }}
                      />
                    </div>

                    {/* Time Statistics Row */}
                    <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-slate-50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Taken</p>
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                          <Clock className="h-3 w-3 text-primary" />
                          <span className="text-xs">{Math.floor(examResult.timeTaken / 60)}m {Math.round(examResult.timeTaken % 60)}s</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Time / Q</p>
                        <div className="flex items-center justify-end gap-1.5 text-slate-700 font-bold">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <span className="text-xs">{Math.round(examResult.avgTime)}s</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-[13px] font-bold text-slate-500 pt-1">
                      {examResult.percentage >= 80 ? '🏆 Outstanding Performance!' :
                        examResult.percentage >= 60 ? '👏 Great job!' :
                          examResult.percentage >= 40 ? '👍 Good attempt' :
                            'Keep practicing!'}
                    </p>
                  </div>

                  <Button
                    className="w-full h-11 rounded-xl font-bold text-base shadow-lg shadow-primary/20"
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

          {!examResult && (
            <DialogHeader className="p-8 pt-4 border-t bg-white relative z-10">
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex justify-start min-w-[100px] shrink-0">
                  <Button
                    variant="ghost"
                    className="rounded-full px-4 h-11 font-bold text-rose-500 hover:bg-rose-50 transition-all"
                    onClick={() => setConfirmCancelExam(true)}
                  >
                    Cancel
                  </Button>
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
                  <Button
                    className="rounded-full px-6 h-11 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 text-sm"
                    onClick={handleSubmitExam}
                  >
                    Submit Exam
                  </Button>
                </div>
              </div>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
      {/* Result Dialog (Student) */}
      <Dialog open={!!viewingResult} onOpenChange={(open) => !open && setViewingResult(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-2xl bg-white">
          <div className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-4xl mb-1 relative">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {viewingResult?.percentage >= 90 ? '🏆' :
                    viewingResult?.percentage >= 80 ? '🥇' :
                      viewingResult?.percentage >= 70 ? '🥈' :
                        viewingResult?.percentage >= 60 ? '🥉' :
                          viewingResult?.percentage >= 40 ? '👍' : '📚'}
                </motion.span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Exam Result</h2>
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-slate-500 text-xs font-medium">Results for <span className="text-slate-900 font-bold">{viewingResult?.title}</span></p>
                {viewingResult?.createdBy && (
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                    Teacher: <span className="text-slate-600 font-black">{viewingResult.createdBy.firstName} {viewingResult.createdBy.lastName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Score</p>
                  <p className="text-xl font-black text-primary">{viewingResult?.score} <span className="text-slate-300 text-base">/</span> {viewingResult?.totalMarks}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage</p>
                  <p className={`text-xl font-black ${viewingResult?.percentage >= 40 ? 'text-emerald-500' : 'text-rose-500'}`}>{Math.round(viewingResult?.percentage || 0)}%</p>
                </div>
              </div>

              {/* Detailed Stats Grid for Historical View */}
              <div className="grid grid-cols-5 gap-2 py-2.5 border-b border-slate-200">
                <div className="text-center p-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Total</p>
                  <p className="text-lg font-black text-slate-700">{viewingResult?.totalQuestions || (viewingResult as any)?.questionsCount || (viewingResult as any)?.questions?.length || 0}</p>
                </div>
                <div className="text-center p-2 rounded-2xl bg-white border border-blue-100 shadow-sm">
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tight">Attempted</p>
                  <p className="text-lg font-black text-blue-700">{viewingResult?.attemptedCount || viewingResult?.score || 0}</p>
                </div>
                <div className="text-center p-2 rounded-2xl bg-white border border-emerald-100 shadow-sm">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Correct</p>
                  <p className="text-lg font-black text-emerald-700">{viewingResult?.correctCount || viewingResult?.score || 0}</p>
                </div>
                <div className="text-center p-2 rounded-2xl bg-white border border-rose-100 shadow-sm">
                  <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tight">Incorrect</p>
                  <p className="text-lg font-black text-rose-700">{viewingResult?.wrongCount || 0}</p>
                </div>
                <div className="text-center p-2 rounded-2xl bg-white border border-amber-100 shadow-sm">
                  <p className="text-[9px] font-bold text-amber-400 uppercase tracking-tight">Skipped</p>
                  <p className="text-lg font-black text-amber-700">
                    {viewingResult?.attemptedCount !== undefined
                      ? (viewingResult?.totalQuestions || 0) - (viewingResult?.attemptedCount || 0)
                      : (viewingResult?.totalQuestions || (viewingResult as any)?.questionsCount || 0) - (viewingResult?.score || 0)
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${viewingResult?.percentage >= 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${viewingResult?.percentage || 0}%` }}
                  />
                </div>

                {/* Time Statistics Row for Historical Result */}
                <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-slate-200">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Taken</p>
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Clock className="h-3 w-3 text-primary" />
                      <span className="text-xs">{viewingResult?.timeTaken ? `${Math.floor(viewingResult.timeTaken / 60)}m ${Math.round(viewingResult.timeTaken % 60)}s` : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Time / Q</p>
                    <div className="flex items-center justify-end gap-1.5 text-slate-700 font-bold">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span className="text-xs">{viewingResult?.avgTimePerQuestion ? `${Math.round(viewingResult.avgTimePerQuestion)}s` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[13px] font-bold text-slate-500 pt-1">
                  {viewingResult?.percentage >= 80 ? '🏆 Outstanding Performance!' :
                    viewingResult?.percentage >= 60 ? '👏 Great job!' :
                      viewingResult?.percentage >= 40 ? '👍 Good attempt' :
                        'Keep practicing!'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl font-bold text-base border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                onClick={() => {
                  if (!viewingResult) return;
                  const examToStart = { ...viewingResult };
                  setViewingResult(null);
                  handleStartExam(examToStart);
                }}
              >
                <Plus className="h-5 w-5" />
                Retake Exam
              </Button>
              <Button
                className="w-full h-11 rounded-xl font-bold text-base shadow-lg shadow-primary/20"
                onClick={() => setViewingResult(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
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