import Sidebar from "./Sidebar";
import AppHeader from "../pages/AppHeader";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
