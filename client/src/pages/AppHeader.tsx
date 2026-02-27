import { useLocation } from "wouter";
import { useEffect, useState } from "react";
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
import { BrainCircuit, Settings, LogOut, BookOpenIcon } from "lucide-react";

type UserType = {
    name: string;
    email: string;
};

export default function AppHeader() {
    const [, setLocation] = useLocation();
    const [user, setUser] = useState<UserType | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setLocation("/");
    };

    return (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setLocation("/dashboard")}
                >
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                        ExamAI
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="hidden md:flex gap-2 rounded-full border-slate-200">
                        <BookOpenIcon className="h-4 w-4" />
                        <span>Documentation</span>
                    </Button>

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
                                    <p className="text-sm font-medium leading-none">
                                        {user?.name || "Guest User"}
                                    </p>
                                    <p className="text-xs leading-none text-slate-500">
                                        {user?.email || "guest@example.com"}
                                    </p>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={() => setLocation("/settings")}
                            >
                                <Settings className="h-4 w-4 text-slate-500" />
                                <span>Settings</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}