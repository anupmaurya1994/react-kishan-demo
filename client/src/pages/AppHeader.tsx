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
import { BrainCircuit, Settings, LogOut } from "lucide-react";

type UserType = {
    name: string;
    email: string;
};

export default function AppHeader() {
    const [, setLocation] = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                <div />
                <div className="flex items-center gap-3">
                    {/* User Info */}
                    {user && (
                        <div className="hidden md:flex flex-col items-end gap-0">
                            <span className="text-sm font-bold text-slate-700 leading-tight">{user.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</span>
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
                                    <p className="text-sm font-medium leading-none">
                                        {user?.name || "Guest User"}
                                    </p>
                                    <p className="text-xs leading-none text-slate-500">
                                        {user?.email || "guest@example.com"}
                                    </p>
                                    <div className="pt-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                            user?.role === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {user?.role || 'Guest'}
                                        </span>
                                    </div>
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