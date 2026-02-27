import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Search, Bell, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1121]/80 backdrop-blur-sm sticky top-0 z-40">
          <div>
            <h2 className="text-white font-display font-semibold text-lg">
              Welcome back, <span className="text-primary">{user?.username || "Doctor"}</span>
            </h2>
            <p className="text-sm text-muted-foreground">Here's what's happening today.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-white/5 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>

            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-[#0b1121]" />
            </button>

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0b1121] flex items-center justify-center overflow-hidden">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
