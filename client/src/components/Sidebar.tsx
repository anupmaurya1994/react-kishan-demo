import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import {
    LayoutDashboard,
    PlusCircle,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    BrainCircuit,
    LogOut,
    GraduationCap,
    Clock,
    Trophy,
    UserCircle,
    ShieldCheck,
    Users,
    School
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
    const [location] = useLocation();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const teacherLinks = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Create Exam", href: "/create-exam", icon: PlusCircle },
        { name: "All Exams", href: "/exam-lists", icon: FileText },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    const studentLinks = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Exams", href: "/exams", icon: FileText },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { name: "Profile", href: "/profile", icon: UserCircle },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    const adminLinks = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "All Exams", href: "/exam-lists", icon: FileText },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { name: "Manage Teachers", href: "/admin/teachers", icon: School },
        { name: "Manage Students", href: "/admin/students", icon: Users },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    const links = user?.role === "admin" ? adminLinks : (user?.role === "teacher" ? teacherLinks : studentLinks);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            className="h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 transition-all duration-300 ease-in-out"
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
                <Link href="/dashboard">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                            <BrainCircuit className="h-6 w-6 text-white" />
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xl font-black tracking-tight text-slate-900 dark:text-white"
                            >
                                ExamAI
                            </motion.span>
                        )}
                    </div>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const isActive = location === link.href;
                    const Icon = link.icon;

                    return (
                        <Link key={link.href} href={link.href}>
                            <div className={`
                                group flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-200
                                ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary'}
                            `}>
                                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-bold text-[15px]"
                                    >
                                        {link.name}
                                    </motion.span>
                                )}
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
                <Button
                    variant="ghost"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full justify-start gap-3 rounded-2xl h-12 text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    {!isCollapsed && <span className="font-bold text-sm">Collapse Sidebar</span>}
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => logout()}
                    className="w-full justify-start gap-3 rounded-2xl h-12 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
                </Button>
            </div>
        </motion.aside>
    );
}
