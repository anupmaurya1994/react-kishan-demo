import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrainCircuit, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type UserType = {
    name: string;
    email: string;
};

export default function AppHeader() {
    const [, setLocation] = useLocation();
    const { user, logout } = useAuth();
    
    // Theme state initialized from localStorage (per-user) or system preference
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            // We'll try to get the user-specific theme later in an effect once user is available
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Handle theme initialization and synchronization when user changes
    useEffect(() => {
        if (user) {
            const userThemeKey = `theme_user_${user._id || user.id}`;
            const savedUserTheme = localStorage.getItem(userThemeKey);
            
            if (savedUserTheme) {
                setIsDark(savedUserTheme === 'dark');
            }
        }
    }, [user]);

    // Apply theme changes to document element and persist to localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (user) {
                localStorage.setItem(`theme_user_${user._id || user.id}`, 'dark');
            }
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (user) {
                localStorage.setItem(`theme_user_${user._id || user.id}`, 'light');
            }
        }
    }, [isDark, user]);

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                <div />
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDark(!isDark)}
                        className="rounded-full w-10 h-10 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors border-0"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isDark ? "moon" : "sun"}
                                initial={{ y: -10, opacity: 0, rotate: -45 }}
                                animate={{ y: 0, opacity: 1, rotate: 0 }}
                                exit={{ y: 10, opacity: 0, rotate: 45 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isDark ? (
                                    <Moon className="h-5 w-5 text-indigo-400" />
                                ) : (
                                    <Sun className="h-5 w-5 text-amber-500" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Button>

                    {/* User Info */}
                    {user && (
                        <div className="hidden md:flex flex-col items-end gap-0">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{user.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user.role}</span>
                        </div>
                    )}

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-full"
                            >
                                <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm transition-transform hover:scale-105">
                                    <AvatarImage
                                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                        alt="User"
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {user?.name?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-56"
                            align="end"
                            forceMount
                        >
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100">
                                        {user?.name || "Guest User"}
                                    </p>
                                    <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                                        {user?.email || "guest@example.com"}
                                    </p>
                                    <div className="pt-2">
                                        <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-lg tracking-wider ${
                                            user?.role === 'teacher' 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
                                            : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                        }`}>
                                            {user?.role || 'Guest'}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                className="cursor-pointer gap-2 py-3 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors rounded-xl mx-1 my-1"
                                onClick={() => setLocation("/settings")}
                            >
                                <Settings className="h-4 w-4 text-slate-500" />
                                <span className="font-bold text-slate-700 dark:text-slate-200">Settings</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="dark:bg-slate-800" />

                            <DropdownMenuItem
                                className="cursor-pointer gap-2 py-3 text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20 transition-colors rounded-xl mx-1 my-1"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="font-bold">Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}