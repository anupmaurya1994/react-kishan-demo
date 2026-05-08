import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";
import { 
    Users, 
    Search, 
    Trash2, 
    User, 
    Mail, 
    Calendar, 
    Award, 
    TrendingUp, 
    ChevronRight,
    MoreVertical,
    AlertCircle,
    Shield,
    FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { generateStudentReportPDF } from "../lib/pdf-generator";

export default function AdminStudents() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [studentToDelete, setStudentToDelete] = useState<any>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [selectedStudentScores, setSelectedStudentScores] = useState<any>(null);
    const [selectedProfileData, setSelectedProfileData] = useState<any>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [triggeringBadges, setTriggeringBadges] = useState(false);

    const handleTriggerBadges = async (timeframe: "weekly" | "monthly") => {
        try {
            setTriggeringBadges(true);
            const res = await apiRequest("POST", "/api/admin/badges/trigger", { timeframe });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message || "Failed to trigger badge awarding");
            }
        } catch (error) {
            toast.error("Error triggering badge awarding");
        } finally {
            setTriggeringBadges(false);
        }
    };

    const handleViewProfile = async (student: any) => {
        setSelectedStudent(student);
        setSelectedProfileData(null);
        fetchDetailedProfile(student._id);
    };

    const handleViewScores = async (student: any) => {
        setSelectedStudentScores(student);
        setSelectedProfileData(null);
        fetchDetailedProfile(student._id);
    };

    const fetchDetailedProfile = async (studentId: string) => {
        setProfileLoading(true);
        try {
            const res = await apiRequest("GET", `/api/exams/student/profile/${studentId}`);
            const data = await res.json();
            if (data.success) {
                setSelectedProfileData(data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch student details");
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role !== "admin") {
            setLocation("/dashboard");
            return;
        }
        fetchStudents();
    }, [user, setLocation]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await apiRequest("GET", "/api/admin/students");
            const data = await res.json();
            if (data.success) {
                setStudents(data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch students");
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        try {
            const res = await apiRequest("DELETE", `/api/admin/students/${studentToDelete._id}`);
            if (res.ok) {
                toast.success("Student deleted successfully");
                setStudents(students.filter(s => s._id !== studentToDelete._id));
            } else {
                toast.error("Failed to delete student");
            }
        } catch (error) {
            toast.error("Error deleting student");
        } finally {
            setStudentToDelete(null);
        }
    };

    const handleDownloadReport = () => {
        const student = selectedStudent || selectedStudentScores;
        if (!selectedProfileData || !student) {
            toast.error("No data available to download or data still loading. Please wait a moment.");
            return;
        }

        toast.info("Generating professional PDF report...");
        try {
            generateStudentReportPDF(student, selectedProfileData);
            toast.success("Report generated successfully");
        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}. Falling back to CSV...`);
            
            // Fallback to CSV if PDF fails
            const headers = ["Exam Title", "Subject", "Score", "Total Marks", "Percentage", "Date"];
            const rows = (selectedProfileData.attempts || []).map((a: any) => [
                `"${(a.title || 'Untitled').replace(/"/g, '""')}"`,
                `"${(a.subject || 'N/A').replace(/"/g, '""')}"`,
                a.score || 0,
                a.totalMarks || 0,
                `"${a.percentage || 0}%"`,
                `"${new Date(a.date).toLocaleDateString()}"`
            ]);

            const firstName = student.firstName || "Student";
            const lastName = student.lastName || "";
            const csvContent = [
                ["Student Performance Report"],
                ["Name", `"${firstName} ${lastName}"`],
                ["Email", `"${student.email || 'N/A'}"`],
                ["Average Score", `"${selectedProfileData.avgScore || 0}%"`],
                ["Global Rank", `"#${selectedProfileData.rank || 'N/A'} / ${selectedProfileData.totalStudents || 0}"`],
                [],
                headers,
                ...rows
            ].map(e => e.join(",")).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `Report_${firstName.replace(/\s+/g, '_')}_${lastName.replace(/\s+/g, '_')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownloadAllStudents = () => {
        if (!students.length) {
            toast.error("No student data available to download");
            return;
        }

        const headers = ["First Name", "Last Name", "Email", "Total Exams", "Average Score", "Joined Date"];
        const rows = students.map((s: any) => [
            `"${(s.firstName || '').replace(/"/g, '""')}"`,
            `"${(s.lastName || '').replace(/"/g, '""')}"`,
            `"${s.email}"`,
            s.totalExams || 0,
            `"${s.avgScore || 0}%"`,
            `"${new Date(s.createdAt).toLocaleDateString()}"`
        ]);

        const csvContent = [
            ["All Students Report"],
            ["Total Students", students.length],
            [],
            headers,
            ...rows
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `All_Students_Report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredStudents = students.filter(s => {
        const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim().toLowerCase();
        const email = (s.email || "").toLowerCase();
        const search = searchQuery.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-indigo-500/10 p-2 rounded-xl">
                            <Shield className="h-5 w-5 text-indigo-500" />
                        </div>
                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-0 font-bold">Admin Panel</Badge>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                        Student Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1">Manage student profiles, monitor scores, and system access.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Students</p>
                        <p className="text-2xl font-black text-primary">{students.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group flex-1 max-w-2xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search by name or email..." 
                        className="h-14 pl-14 pr-6 rounded-2xl border-white dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm focus-visible:ring-primary/20 text-lg font-medium transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button 
                    variant="outline" 
                    className="h-14 px-6 rounded-2xl border-white dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm font-bold flex gap-2 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300"
                    onClick={handleDownloadAllStudents}
                >
                    <FileText className="h-5 w-5 text-indigo-500" />
                    Download All Data
                </Button>
            </div>

            {/* Students Grid/List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spinner className="size-12 text-primary" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Fetching global student list...</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No students found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student, idx) => (
                        <motion.div
                            key={student._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="border-white dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group">
                                <CardHeader className="pb-4 relative">
                                    <div className="absolute top-6 right-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5">
                                                    <MoreVertical className="h-5 w-5 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
                                                <DropdownMenuItem 
                                                    className="rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                                                    onClick={() => handleViewProfile(student)}
                                                >
                                                    <User className="h-4 w-4 mr-2" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                                                    onClick={() => handleViewScores(student)}
                                                >
                                                    <Award className="h-4 w-4 mr-2" /> View Scores
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="rounded-xl px-4 py-2 text-rose-600 font-bold cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                    onClick={() => setStudentToDelete(student)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete Student
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16 rounded-2xl border-2 border-primary/20 bg-primary/5">
                                            <AvatarFallback className="text-xl font-black text-primary">
                                                {(student.firstName?.[0] || student.email?.[0] || "U").toUpperCase()}
                                                {(student.lastName?.[0] || "").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <CardTitle className="text-xl font-black text-slate-900 dark:text-slate-100 truncate">
                                                {student.firstName || "Unnamed"} {student.lastName || "User"}
                                            </CardTitle>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{student.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Award className="h-3.5 w-3.5 text-amber-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score</span>
                                            </div>
                                            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{student.avgScore}%</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exams</span>
                                            </div>
                                            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{student.totalExams}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                            <Calendar className="h-3 w-3" />
                                            Joined {new Date(student.createdAt).toLocaleDateString()}
                                        </div>
                                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-bold">Active</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Student Profile Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
                <DialogContent className="rounded-[2.5rem] border-0 dark:border dark:border-slate-800 p-0 overflow-hidden shadow-2xl max-w-2xl bg-white dark:bg-slate-950">
                    {profileLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Spinner className="size-10 text-primary" />
                            <p className="font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Profile...</p>
                        </div>
                    ) : (
                        <>
                            <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600" />
                    <div className="px-8 pb-8 -mt-12">
                        <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
                            <Avatar className="h-32 w-32 rounded-3xl border-4 border-white dark:border-slate-950 shadow-xl">
                                <AvatarFallback className="text-4xl font-black bg-indigo-100 text-indigo-600">
                                    {(selectedStudent?.firstName?.[0] || selectedStudent?.email?.[0] || "S").toUpperCase()}
                                    {(selectedStudent?.lastName?.[0] || "").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 pb-2">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                                    {selectedStudent?.firstName || "Unnamed"} {selectedStudent?.lastName || "User"}
                                </h2>
                                <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs">Student Profile</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Information</p>
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><Mail className="h-4 w-4 text-indigo-500" /></div>
                                        {selectedStudent?.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><Calendar className="h-4 w-4 text-indigo-500" /></div>
                                        Joined {selectedStudent?.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : "N/A"}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">System Status</span>
                                        <Badge className="bg-emerald-500 text-white border-0 font-bold">Active</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Exams</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">{selectedStudent?.totalExams}</span>
                                        </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Average Score</span>
                                                    <span className="text-lg font-black text-indigo-500">{selectedProfileData?.avgScore || 0}%</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Global Rank</span>
                                                    <span className="text-lg font-black text-amber-500">#{selectedProfileData?.rank || "N/A"} / {selectedProfileData?.totalStudents || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <Button 
                                variant="ghost" 
                                className="rounded-xl font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                                onClick={handleDownloadReport}
                            >
                                Download Full Report
                            </Button>
                        </div>
                    </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Student Scores Dialog */}
            <Dialog open={!!selectedStudentScores} onOpenChange={() => setSelectedStudentScores(null)}>
                <DialogContent className="rounded-[2.5rem] border-0 dark:border dark:border-slate-800 p-8 shadow-2xl max-w-2xl bg-white dark:bg-slate-950">
                    {profileLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Spinner className="size-10 text-primary" />
                            <p className="font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Scores...</p>
                        </div>
                    ) : (
                        <>
                            <DialogHeader className="mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-500/10 p-3 rounded-2xl">
                                <Award className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Exam Score History</DialogTitle>
                                <p className="text-slate-500 font-medium">{selectedStudentScores?.firstName}'s performance breakdown</p>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedProfileData?.attempts?.length > 0 ? (
                            selectedProfileData.attempts.map((exam: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500/50 transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <div className="bg-white dark:bg-slate-800 h-12 w-12 rounded-xl flex items-center justify-center shadow-sm">
                                            <FileText className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white">{exam.title}</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{exam.subject} • {new Date(exam.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black ${exam.percentage >= 90 ? 'text-emerald-500' : exam.percentage >= 75 ? 'text-indigo-500' : 'text-amber-500'}`}>
                                            {exam.percentage}%
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-50 font-bold italic">No exam attempts recorded.</div>
                        )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Rank</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">#{selectedProfileData?.rank || "N/A"} / {selectedProfileData?.totalStudents || 0}</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="rounded-xl font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                            onClick={handleDownloadReport}
                        >
                            Download Full Report
                        </Button>
                    </div>
                </>
            )}
        </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <AlertDialogContent className="rounded-[2.5rem] border-0 dark:border dark:border-slate-800 p-8 shadow-2xl max-w-md bg-white dark:bg-slate-900">
                    <AlertDialogHeader>
                        <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-slate-100">Delete Student?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-500 dark:text-slate-400 text-base font-medium mt-2">
                            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-slate-200">{studentToDelete?.firstName || "this"} {studentToDelete?.lastName || "student"}</span>? This will permanently remove all their data, scores, and exam attempts.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 sm:justify-center gap-3">
                        <AlertDialogCancel className="w-full rounded-2xl h-12 font-bold border-slate-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="w-full rounded-2xl h-12 font-bold bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20 border-0"
                            onClick={handleDeleteStudent}
                        >
                            Delete student
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
