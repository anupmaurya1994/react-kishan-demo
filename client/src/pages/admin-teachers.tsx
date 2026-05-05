import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    School,
    BookOpen,
    Building2,
    MapPin,
    Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
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
    DialogDescription,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { generateTeacherReportPDF } from "../lib/pdf-generator";

export default function AdminTeachers() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [teacherToDelete, setTeacherToDelete] = useState<any>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

    useEffect(() => {
        if (user?.role !== "admin") {
            setLocation("/dashboard");
            return;
        }
        fetchTeachers();
    }, [user, setLocation]);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const res = await apiRequest("GET", "/api/admin/teachers");
            const data = await res.json();
            if (data.success) {
                setTeachers(data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch teachers");
            // Mock data for demo
            setTeachers([
                { 
                    _id: "t1", 
                    firstName: "Dr. Rajesh", 
                    lastName: "Khanna", 
                    email: "rajesh@university.edu", 
                    role: "teacher",
                    profession: "Professor",
                    subject: "Physics",
                    college: "IIT Bombay",
                    city: "Mumbai",
                    state: "Maharashtra",
                    totalExams: 24, 
                    totalQuestions: 850,
                    createdAt: "2023-09-15" 
                },
                { 
                    _id: "t2", 
                    firstName: "Meera", 
                    lastName: "Nair", 
                    email: "meera@college.ac.in", 
                    role: "teacher",
                    profession: "Assistant Professor",
                    subject: "Literature",
                    college: "St. Stephens",
                    city: "Delhi",
                    state: "Delhi",
                    totalExams: 18, 
                    totalQuestions: 420,
                    createdAt: "2024-01-10" 
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeacher = async () => {
        if (!teacherToDelete) return;
        try {
            const res = await apiRequest("DELETE", `/api/admin/teachers/${teacherToDelete._id}`);
            if (res.ok) {
                toast.success("Teacher account removed");
                setTeachers(teachers.filter(t => t._id !== teacherToDelete._id));
            } else {
                toast.error("Failed to delete teacher");
            }
        } catch (error) {
            toast.error("Error deleting teacher");
        } finally {
            setTeacherToDelete(null);
        }
    };

    const handleDownloadReport = () => {
        if (!selectedTeacher) {
            toast.error("No teacher selected");
            return;
        }

        toast.info("Generating teacher profile report...");
        try {
            generateTeacherReportPDF(selectedTeacher);
            toast.success("Teacher report generated");
        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}. Falling back to CSV...`);
            
            const firstName = selectedTeacher.firstName || "Teacher";
            const lastName = selectedTeacher.lastName || "";
            const csvContent = [
                ["Teacher Report"],
                ["Name", `"${firstName} ${lastName}"`],
                ["Email", `"${selectedTeacher.email || 'N/A'}"`],
                ["Profession", `"${selectedTeacher.profession || 'N/A'}"`],
                ["Institution", `"${selectedTeacher.college || 'N/A'}"`],
                ["Department", `"${selectedTeacher.subject || 'N/A'}"`],
                ["Location", `"${selectedTeacher.city || ''}, ${selectedTeacher.state || ''}"`],
                [],
                ["Statistics"],
                ["Total Exams", selectedTeacher.totalExams || 0],
                ["Total Questions", selectedTeacher.totalQuestions || 0],
                ["Status", "Active"],
                ["Member Since", `"${selectedTeacher.createdAt ? new Date(selectedTeacher.createdAt).toLocaleDateString() : 'N/A'}"`]
            ].map(e => e.join(",")).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `Teacher_Report_${firstName.replace(/\s+/g, '_')}_${lastName.replace(/\s+/g, '_')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const filteredTeachers = teachers.filter(t => {
        const fullName = `${t.firstName || ""} ${t.lastName || ""}`.toLowerCase();
        const email = (t.email || "").toLowerCase();
        const college = (t.college || "").toLowerCase();
        const subject = (t.subject || "").toLowerCase();
        const search = searchQuery.toLowerCase();
        return fullName.includes(search) || email.includes(search) || college.includes(search) || subject.includes(search);
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-violet-500/10 p-2 rounded-xl">
                            <School className="h-5 w-5 text-violet-500" />
                        </div>
                        <Badge variant="secondary" className="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0 font-bold">Admin Panel</Badge>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                        Teacher Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1">Manage instructor accounts, institutions, and content oversight.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Teachers</p>
                        <p className="text-2xl font-black text-violet-600">{teachers.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
                        <School className="h-6 w-6 text-violet-500" />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <Input 
                    placeholder="Search by name, email or institution..." 
                    className="h-14 pl-14 pr-6 rounded-2xl border-white dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm focus-visible:ring-violet-500/20 text-lg font-medium transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Teachers Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spinner className="size-12 text-violet-500" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Loading instructor data...</p>
                </div>
            ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <School className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No teachers found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Try searching with different keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map((teacher, idx) => (
                        <motion.div
                            key={teacher._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="border-white dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group">
                                <CardHeader className="pb-4 relative">
                                    <div className="absolute top-6 right-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-violet-500/5">
                                                    <MoreVertical className="h-5 w-5 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
                                                <DropdownMenuItem 
                                                    className="rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                                                    onClick={() => setSelectedTeacher(teacher)}
                                                >
                                                    <User className="h-4 w-4 mr-2" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                                                    <BookOpen className="h-4 w-4 mr-2" /> View Exams
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="rounded-xl px-4 py-2 text-rose-600 font-bold cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                    onClick={() => setTeacherToDelete(teacher)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16 rounded-2xl border-2 border-violet-500/20 bg-violet-500/5">
                                            <AvatarFallback className="text-xl font-black text-violet-600">
                                                {(teacher.firstName?.[0] || teacher.email?.[0] || "T").toUpperCase()}
                                                {(teacher.lastName?.[0] || "").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <CardTitle className="text-xl font-black text-slate-900 dark:text-slate-100 truncate">
                                                {teacher.firstName} {teacher.lastName}
                                            </CardTitle>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{teacher.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            <Building2 className="h-4 w-4 text-violet-500" />
                                            <span className="truncate">{teacher.college || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            <Briefcase className="h-4 w-4 text-violet-500" />
                                            <span>{teacher.subject || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Exams</span>
                                            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{teacher.totalExams || 0}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Questions</span>
                                            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{teacher.totalQuestions || 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                            <Calendar className="h-3 w-3" />
                                            Joined {new Date(teacher.createdAt).toLocaleDateString()}
                                        </div>
                                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-bold">Verified</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Profile Dialog */}
            <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
                <DialogContent className="rounded-[2.5rem] border-0 dark:border dark:border-slate-800 p-0 overflow-hidden shadow-2xl max-w-2xl bg-white dark:bg-slate-950">
                    <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    <div className="px-8 pb-8 -mt-12">
                        <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
                            <Avatar className="h-32 w-32 rounded-3xl border-4 border-white dark:border-slate-950 shadow-xl">
                                <AvatarFallback className="text-4xl font-black bg-violet-100 text-violet-600">
                                    {selectedTeacher?.firstName?.[0]}{selectedTeacher?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 pb-2">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                                    {selectedTeacher?.firstName} {selectedTeacher?.lastName}
                                </h2>
                                <p className="text-violet-500 font-bold uppercase tracking-widest text-xs">{selectedTeacher?.profession || "Instructor"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</Label>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                        <Mail className="h-4 w-4 text-violet-500" />
                                        {selectedTeacher?.email}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Institution</Label>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                        <Building2 className="h-4 w-4 text-violet-500" />
                                        {selectedTeacher?.college || "Not provided"}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Location</Label>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                        <MapPin className="h-4 w-4 text-violet-500" />
                                        {selectedTeacher?.city}, {selectedTeacher?.state}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Department</Label>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                        <Briefcase className="h-4 w-4 text-violet-500" />
                                        {selectedTeacher?.subject || "General"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedTeacher?.totalExams}</p>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Total Exams</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedTeacher?.totalQuestions}</p>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Questions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">Active</p>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Status</p>
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
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!teacherToDelete} onOpenChange={(open) => !open && setTeacherToDelete(null)}>
                <AlertDialogContent className="rounded-[2.5rem] border-0 dark:border dark:border-slate-800 p-8 shadow-2xl max-w-md bg-white dark:bg-slate-900">
                    <AlertDialogHeader>
                        <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-slate-100">Remove Teacher?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-500 dark:text-slate-400 text-base font-medium mt-2">
                            Are you sure you want to remove <span className="font-bold text-slate-900 dark:text-slate-200">{teacherToDelete?.firstName} {teacherToDelete?.lastName}</span>? This will revoke their platform access and archive their content.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 sm:justify-center gap-3">
                        <AlertDialogCancel className="w-full rounded-2xl h-12 font-bold border-slate-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="w-full rounded-2xl h-12 font-bold bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20 border-0"
                            onClick={handleDeleteTeacher}
                        >
                            Delete account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
