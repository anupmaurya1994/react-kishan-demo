import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Plus, FileText, Clock, Settings, LogOut, FileUp, Sparkles, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/");
  };

  const mockExams = [
    { id: 1, title: "Midterm Biology 101", subject: "Biology", date: "Oct 12, 2023", questions: 45, status: "Published", statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { id: 2, title: "Physics Chapter 4-5", subject: "Physics", date: "Oct 15, 2023", questions: 30, status: "Draft", statusColor: "bg-slate-100 text-slate-800 border-slate-200" },
    { id: 3, title: "Computer Science Finals", subject: "Computer Science", date: "Oct 20, 2023", questions: 50, status: "Processing", statusColor: "bg-blue-100 text-blue-800 border-blue-200" },
  ];

  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ExamAI</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:flex gap-2 rounded-full border-slate-200">
              <BookOpenIcon className="h-4 w-4" />
              <span>Documentation</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm transition-transform hover:scale-105">
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Teacher" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">JS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {/* <p className="text-sm font-medium leading-none">Prof. Jane Smith</p> */}
                    <p className="text-sm font-medium leading-none">{user?.name || "Guest User"}</p>
                    {/* <p className="text-xs leading-none text-slate-500">jane.smith@state.edu</p> */}
                    <p className="text-xs leading-none text-slate-500">{user?.email || "guest@example.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleLogout} data-testid="menu-logout">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back, {user?.name || "Guest"} 👋</h1>
            <p className="text-slate-500 font-inter">Here's an overview of your recent exams and generations.</p>
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
              <p className="text-slate-500 text-sm font-inter">Upload PDFs, DOCX, or images containing your syllabus or notes.</p>
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
              <p className="text-slate-500 text-sm font-inter">Our AI instantly drafts MCQs, short answers, and essay questions.</p>
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
              <p className="text-slate-500 text-sm font-inter">Edit questions, adjust difficulty, and publish to your students.</p>
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
            {mockExams.map((exam) => (
              <Card key={exam.id} className="border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-xl group cursor-pointer" data-testid={`card-exam-${exam.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 font-medium text-xs border ${exam.statusColor}`}>
                      {exam.status}
                    </Badge>
                    <div className="bg-slate-100 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                  <CardTitle className="text-lg text-slate-800 leading-tight group-hover:text-primary transition-colors">{exam.title}</CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500">{exam.subject}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center gap-4 text-sm text-slate-500 font-inter">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>{exam.questions} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{exam.date}</span>
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