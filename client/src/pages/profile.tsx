import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, GraduationCap, BookOpen, Brain, Loader2, Zap, BarChart, Trophy, Mail } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

type ProfileData = {
  studentId: string;
  name: string;
  email: string;
  totalExams: number;
  avgScore: number;
  easyExams: number;
  mediumExams: number;
  hardExams: number;
  badgeCounts: {
    weekly: { gold: number; silver: number; bronze: number };
    monthly: { gold: number; silver: number; bronze: number };
    total: number;
  };
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgeTimeframe, setBadgeTimeframe] = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Using /me endpoint so backend infers the user ID from the token
        const res = await apiRequest("GET", `/api/exams/student/profile/me`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          setError(data.message || "Failed to load profile");
        }
      } catch (err: any) {
        setError(err.message || "Could not connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background dark:bg-slate-950 transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background dark:bg-slate-950 transition-colors duration-300">
        <p className="text-slate-500 dark:text-slate-400 font-semibold">{error || "Profile not found"}</p>
      </div>
    );
  }

  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen flex flex-col transition-colors duration-300">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Award className="w-64 h-64" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-inner">
                <span className="text-6xl font-black">{profile.name.charAt(0)}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                  {profile.name}
                </h1>
                <div className="flex flex-col gap-2">
                  <p className="text-white/80 font-medium flex items-center justify-center md:justify-start gap-2 text-lg">
                    <GraduationCap className="w-5 h-5" />
                    Student Profile
                  </p>
                  <p className="text-white/90 font-medium flex items-center justify-center md:justify-start gap-2">
                    <Mail className="w-4 h-4 opacity-80" />
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Stats Cards */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-8 rounded-[2rem] border-0 shadow-lg bg-white dark:bg-slate-900 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300 h-full border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <BookOpen className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Exams</p>
              <p className="text-5xl font-black text-slate-900 dark:text-slate-100">{profile.totalExams}</p>
            </Card>
          </motion.div>

          {/* Badges Card */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-8 rounded-[2rem] border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden group hover:-translate-y-1 transition-all duration-300 h-full relative border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Badges Earned</h2>
                </div>
                
                {/* Badge Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                  <button 
                    onClick={() => setBadgeTimeframe("weekly")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${badgeTimeframe === "weekly" ? "bg-white dark:bg-slate-950 text-primary shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
                  >
                    Weekly
                  </button>
                  <button 
                    onClick={() => setBadgeTimeframe("monthly")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${badgeTimeframe === "monthly" ? "bg-white dark:bg-slate-950 text-primary shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg shadow-amber-200 dark:shadow-none flex items-center justify-center mb-2">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{profile.badgeCounts[badgeTimeframe].gold}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gold</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center mb-2">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{profile.badgeCounts[badgeTimeframe].silver}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Silver</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-orange-300 to-orange-400 shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center mb-2">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{profile.badgeCounts[badgeTimeframe].bronze}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bronze</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-8 rounded-[2rem] border-0 shadow-lg bg-white dark:bg-slate-900 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <BarChart className="w-8 h-8 text-amber-500 group-hover:text-white" />
              </div>
              <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Average Score</p>
              <p className="text-5xl font-black text-slate-900 dark:text-slate-100">{profile.avgScore}%</p>
            </Card>
          </motion.div>
          
          <div className="flex flex-col gap-6">
             <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 px-2">
              <Brain className="w-6 h-6 text-primary" />
              Difficulty
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 rounded-3xl border-0 shadow-sm bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Easy</p>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{profile.easyExams}</div>
              </Card>
              <Card className="p-4 rounded-3xl border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1">Medium</p>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-500">{profile.mediumExams}</div>
              </Card>
              <Card className="p-4 rounded-3xl border-0 shadow-sm bg-rose-50 dark:bg-rose-900/20 text-center">
                <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-1">Hard</p>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-500">{profile.hardExams}</div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
