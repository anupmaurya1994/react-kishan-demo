import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Search, Medal, Loader2, Clock, BookOpen, Brain, Zap, GraduationCap, BarChart, ArrowUpRight, ArrowDownRight, Scale, Mail, Award } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type LeaderEntry = {
  rank: number;
  studentId: string;
  name: string;
  totalPoints: number;
  examsTaken: number;
  avgScore: number;
};

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

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "overall">("overall");
  const [leaderboardData, setLeaderboardData] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);

  // Profile Modal State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Compare State
  const [isComparing, setIsComparing] = useState(false);
  const [myProfile, setMyProfile] = useState<ProfileData | null>(null);
  const [myProfileLoading, setMyProfileLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("GET", `/api/exams/leaderboard?timeframe=${timeframe}`);
        const data = await res.json();
        if (data.success) {
          setLeaderboardData(data.data);
          if (data.nextUpdate) {
            setNextUpdate(new Date(data.nextUpdate).toLocaleTimeString([], { hour: '2-digit', hour12: true }).replace(':00', ''));
          }
        } else {
          setError(data.message || "Failed to load leaderboard");
        }
      } catch (err: any) {
        setError("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [timeframe]);

  const isMe = (studentId: string, studentName: string) => {
    if ((user as any)?._id) return studentId === (user as any)._id.toString();
    return studentName === user?.name;
  };

  const openStudentProfile = async (studentId: string, studentName: string) => {
    if (isMe(studentId, studentName)) {
      setLocation("/profile");
      return;
    }
    
    setSelectedStudentId(studentId);
    setIsProfileModalOpen(true);
    setIsComparing(false);
    setStudentProfile(null);
    try {
      setProfileLoading(true);
      const res = await apiRequest("GET", `/api/exams/student/profile/${studentId}`);
      const data = await res.json();
      if (data.success) {
        setStudentProfile(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCompareClick = async () => {
    if (!user) return;
    setIsComparing(true);
    if (!myProfile) {
      try {
        setMyProfileLoading(true);
        const res = await apiRequest("GET", `/api/exams/student/profile/me`);
        const data = await res.json();
        if (data.success) {
          setMyProfile(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setMyProfileLoading(false);
      }
    }
  };

  const filteredData = leaderboardData.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = searchQuery ? [] : leaderboardData.slice(0, 3);
  const rest = searchQuery ? filteredData : leaderboardData.slice(top3.length);

  const myEntry = leaderboardData.find(
    s => isMe(s.studentId, s.name)
  );

  const renderComparisonStat = (label: string, myVal: number, theirVal: number, isHigherBetter = true) => {
    const diff = myVal - theirVal;
    const isBetter = isHigherBetter ? diff > 0 : diff < 0;
    const isSame = diff === 0;
    const percentDiff = theirVal > 0 ? Math.round(Math.abs(diff) / theirVal * 100) : (myVal > 0 ? 100 : 0);

    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
        <div className="w-1/3 text-left">
          <span className="font-bold text-slate-800 text-lg">{myVal}</span>
        </div>
        <div className="w-1/3 text-center flex flex-col items-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
          {!isSame && (
            <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded-md ${isBetter ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {isBetter ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {percentDiff}% {isBetter ? 'higher' : 'lower'}
            </span>
          )}
          {isSame && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md mt-0.5">EQUAL</span>}
        </div>
        <div className="w-1/3 text-right">
          <span className="font-bold text-slate-800 text-lg">{theirVal}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50/50 min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Leaderboard
              </h1>
            </div>
            <p className="text-slate-500 font-medium">
              {timeframe === "weekly" 
                ? "Rankings reset every Monday at 5:30 AM. Top students win exclusive badges!" 
                : timeframe === "monthly" 
                ? "Rankings reset on the 1st of every month at 5:30 AM. Win big this month!" 
                : "All-time rankings. Every exam counts towards your total score!"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
             {/* Timeframe Switcher */}
            <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
              <button
                onClick={() => setTimeframe("weekly")}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${timeframe === "weekly" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe("monthly")}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${timeframe === "monthly" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeframe("overall")}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${timeframe === "overall" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Overall
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 font-medium text-slate-700 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Next Update Hint */}
        {timeframe === "overall" && nextUpdate && (
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">
            <Clock className="w-3 h-3" />
            Next Update: {nextUpdate}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-slate-500 font-medium">Updating rankings...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Trophy className="w-12 h-12 text-slate-200" />
            <p className="text-slate-500 font-semibold">{error}</p>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Trophy className="w-12 h-12 text-slate-200" />
            <p className="text-slate-500 font-semibold">No activity in this period. Be the first!</p>
          </div>
        ) : (
          <>
            {/* My Rank Banner */}
            {myEntry && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 bg-gradient-to-r from-primary to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group cursor-pointer"
                onClick={() => setLocation("/profile")}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Trophy className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center border border-white/30">
                    <span className="text-[10px] font-black uppercase leading-none opacity-80">Rank</span>
                    <span className="text-2xl font-black leading-none mt-1">#{myEntry.rank}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                      {myEntry.name}
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase">You</span>
                    </h2>
                    <p className="text-white/70 font-medium">Keep it up! You're in the top {Math.round((myEntry.rank / leaderboardData.length) * 100)}% this period.</p>
                  </div>
                </div>
                <div className="flex gap-8 relative z-10 bg-black/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-black/20 transition-colors">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Points</p>
                    <p className="text-xl font-black">{Math.round(myEntry.totalPoints).toLocaleString()}</p>
                  </div>
                  <div className="w-px h-8 bg-white/20 self-center" />
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Exams</p>
                    <p className="text-xl font-black">{myEntry.examsTaken}</p>
                  </div>
                  <div className="w-px h-8 bg-white/20 self-center" />
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Avg</p>
                    <p className="text-xl font-black">{Math.round(myEntry.avgScore)}%</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Top 3 Podium — only when not searching */}
            {!searchQuery && top3.length > 0 && (
              <div className={`grid ${top3.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : top3.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-3'} gap-4 md:gap-8 mb-16 mt-12 items-end`}>
                {/* Rank 2 */}
                {top3.length >= 2 && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="z-10 relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full text-center">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <Trophy className="w-8 h-8 text-slate-300 mx-auto drop-shadow-lg" />
                      </motion.div>
                    </div>
                    <Card 
                      className="border-0 shadow-lg bg-white relative pt-8 pb-6 flex flex-col items-center rounded-3xl cursor-pointer hover:-translate-y-2 transition-transform duration-300 border-2 border-slate-50"
                      onClick={() => openStudentProfile(top3[1].studentId, top3[1].name)}
                    >
                      <div className="absolute -top-6 bg-slate-100 text-slate-500 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-md border-4 border-white">2</div>
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2 font-black text-slate-300 text-2xl border-2 border-white shadow-inner">
                        {top3[1].name.charAt(0)}
                      </div>
                      <h3 className="font-bold text-slate-800 text-center text-sm md:text-base line-clamp-1 px-2 hover:text-primary transition-colors">{top3[1].name}</h3>
                      <p className="text-primary font-black mt-1">{Math.round(top3[1].totalPoints).toLocaleString()} pts</p>
                      <div className="mt-2 bg-slate-500/10 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Rising Star</div>
                    </Card>
                  </motion.div>
                )}

                {/* Rank 1 */}
                {top3.length >= 1 && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="z-10 relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full text-center">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy className="w-10 h-10 text-amber-400 mx-auto drop-shadow-lg" />
                      </motion.div>
                    </div>
                    <Card 
                      className="border-0 shadow-2xl bg-gradient-to-t from-amber-50 to-white relative pt-12 pb-10 flex flex-col items-center rounded-3xl transform scale-110 border-2 border-amber-100 cursor-pointer hover:scale-115 transition-transform duration-300"
                      onClick={() => openStudentProfile(top3[0].studentId, top3[0].name)}
                    >
                      <div className="absolute -top-8 bg-amber-400 text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-lg border-4 border-white">
                        <Medal className="w-8 h-8" />
                      </div>
                      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-3 font-black text-amber-600 text-3xl border-2 border-white shadow-inner">
                        {top3[0].name.charAt(0)}
                      </div>
                      <h3 className="font-black text-slate-900 text-center text-base md:text-lg line-clamp-1 px-2 hover:text-amber-600 transition-colors">{top3[0].name}</h3>
                      <p className="text-amber-600 font-black mt-1 text-xl">{Math.round(top3[0].totalPoints).toLocaleString()} pts</p>
                      <div className="mt-2 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest">Platform King</div>
                    </Card>
                  </motion.div>
                )}

                {/* Rank 3 */}
                {top3.length >= 3 && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="z-10 relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full text-center">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        <Trophy className="w-8 h-8 text-orange-400 mx-auto drop-shadow-lg" />
                      </motion.div>
                    </div>
                    <Card 
                      className="border-0 shadow-lg bg-white relative pt-8 pb-6 flex flex-col items-center rounded-3xl cursor-pointer hover:-translate-y-2 transition-transform duration-300 border-2 border-orange-50"
                      onClick={() => openStudentProfile(top3[2].studentId, top3[2].name)}
                    >
                      <div className="absolute -top-6 bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-md border-4 border-white">3</div>
                      <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-2 font-black text-orange-200 text-2xl border-2 border-white shadow-inner">
                        {top3[2].name.charAt(0)}
                      </div>
                      <h3 className="font-bold text-slate-800 text-center text-sm md:text-base line-clamp-1 px-2 hover:text-orange-600 transition-colors">{top3[2].name}</h3>
                      <p className="text-orange-600 font-black mt-1">{Math.round(top3[2].totalPoints).toLocaleString()} pts</p>
                      <div className="mt-2 bg-orange-500/10 px-3 py-1 rounded-full text-[10px] font-black text-orange-600 uppercase tracking-widest">Elite Contender</div>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}

            {/* List — #4 and beyond */}
            {rest.length > 0 && (
              <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-5">Student Performance</div>
                  <div className="col-span-2 text-center">Activity</div>
                  <div className="col-span-2 text-center">Avg Score</div>
                  <div className="col-span-2 text-right pr-4">Total Points</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {rest.map((student) => {
                    const me = isMe(student.studentId, student.name);
                    return (
                      <motion.div
                        key={student.studentId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => openStudentProfile(student.studentId, student.name)}
                        className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 items-center transition-all cursor-pointer hover:bg-slate-50/80 ${me ? 'bg-primary/5' : ''}`}
                      >
                        {/* Mobile view */}
                        <div className="flex md:hidden items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="font-black text-lg text-slate-300 w-8">#{student.rank}</div>
                            <div>
                              <p className={`font-bold hover:underline ${me ? 'text-primary' : 'text-slate-800'}`}>
                                {student.name} {me && <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full ml-1 uppercase">Me</span>}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">{student.examsTaken} Exams • {Math.round(student.avgScore)}%</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-lg ${me ? 'text-primary' : 'text-slate-900'}`}>{student.totalPoints.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">PTS</p>
                          </div>
                        </div>

                        {/* Desktop view */}
                        <div className="hidden md:block col-span-1 text-center font-black text-slate-300 text-xl">#{student.rank}</div>
                        <div className="hidden md:flex col-span-5 items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-bold text-base hover:underline ${me ? 'text-primary' : 'text-slate-800'}`}>
                              {student.name}
                            </p>
                            <div className="flex gap-2 items-center mt-0.5">
                              {student.rank <= 10 && <span className="text-[9px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">Elite</span>}
                              {student.avgScore >= 90 && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">Master</span>}
                              {me && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">You</span>}
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block col-span-2 text-center">
                          <p className="font-bold text-slate-600">{student.examsTaken}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase">Exams</p>
                        </div>
                        <div className="hidden md:block col-span-2 text-center">
                          <p className="font-bold text-slate-600">{Math.round(student.avgScore)}%</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase">Average</p>
                        </div>
                        <div className="hidden md:block col-span-2 text-right pr-4">
                          <p className={`font-black text-xl ${me ? 'text-primary' : 'text-slate-900'}`}>{Math.round(student.totalPoints).toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Points</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {rest.length === 0 && searchQuery && (
              <div className="p-16 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-lg">No students found matching "{searchQuery}"</p>
                <p className="text-slate-400 text-sm mt-1">Try a different name or clear the search.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl p-0 overflow-hidden bg-slate-50 border-0 rounded-[2.5rem]">
          {profileLoading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="font-medium text-slate-500">Loading profile...</p>
            </div>
          ) : studentProfile ? (
            <div className="flex flex-col h-full">
              {/* Modal Header/Hero */}
              <div className={`bg-gradient-to-br ${isComparing ? 'from-indigo-600 to-purple-700' : 'from-primary to-indigo-600'} p-8 text-white relative overflow-hidden transition-colors duration-500`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  {isComparing ? <Scale className="w-48 h-48" /> : <Trophy className="w-48 h-48" />}
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-inner">
                      <span className="text-4xl font-black">{studentProfile.name.charAt(0)}</span>
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-black mb-1">{studentProfile.name}</DialogTitle>
                      <div className="flex flex-col gap-1">
                        <p className="text-white/80 font-medium flex items-center gap-2 text-sm">
                          <GraduationCap className="w-4 h-4" /> Student Profile
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {user && (user as any).role !== "teacher" && !isMe(studentProfile.studentId, studentProfile.name) && !isComparing && (
                    <Button 
                      onClick={handleCompareClick}
                      className="bg-white/20 hover:bg-white/30 text-white border-0 font-bold rounded-xl backdrop-blur-sm transition-all"
                    >
                      <Scale className="w-4 h-4 mr-2" />
                      Compare with Me
                    </Button>
                  )}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-6 flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {!isComparing ? (
                    <motion.div 
                      key="profile-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-6 rounded-[2rem] border-0 shadow-sm bg-white flex flex-col items-center text-center">
                          <BookOpen className="w-8 h-8 text-primary mb-3" />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Exams</p>
                          <p className="text-4xl font-black text-slate-900">{studentProfile.totalExams}</p>
                        </Card>
                        <Card className="p-6 rounded-[2rem] border-0 shadow-sm bg-white flex flex-col items-center text-center">
                          <BarChart className="w-8 h-8 text-amber-500 mb-3" />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Average Score</p>
                          <p className="text-4xl font-black text-slate-900">{studentProfile.avgScore}%</p>
                        </Card>
                      </div>

                      <div className="p-6 rounded-[2rem] border-0 shadow-sm bg-white">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" /> Badges Earned
                        </p>
                        <div className="flex justify-around items-center">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-100 mb-2">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black text-slate-900">
                              {(studentProfile.badgeCounts?.monthly?.gold || 0) + (studentProfile.badgeCounts?.weekly?.gold || 0)}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Gold</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center shadow-lg shadow-slate-100 mb-2">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black text-slate-900">
                              {(studentProfile.badgeCounts?.monthly?.silver || 0) + (studentProfile.badgeCounts?.weekly?.silver || 0)}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Silver</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center shadow-lg shadow-orange-100 mb-2">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black text-slate-900">
                              {(studentProfile.badgeCounts?.monthly?.bronze || 0) + (studentProfile.badgeCounts?.weekly?.bronze || 0)}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Bronze</span>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-black text-slate-800 text-lg flex items-center gap-2 px-2">
                        <Brain className="w-5 h-5 text-primary" /> Difficulty Breakdown
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-emerald-50 text-center">
                          <div className="text-emerald-700 font-bold mb-2">Easy</div>
                          <div className="text-3xl font-black text-emerald-600">{studentProfile.easyExams}</div>
                        </Card>
                        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-blue-50 text-center">
                          <div className="text-blue-700 font-bold mb-2">Medium</div>
                          <div className="text-3xl font-black text-blue-600">{studentProfile.mediumExams}</div>
                        </Card>
                        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-rose-50 text-center">
                          <div className="text-rose-700 font-bold mb-2">Hard</div>
                          <div className="text-3xl font-black text-rose-600">{studentProfile.hardExams}</div>
                        </Card>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="compare-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-[2rem] p-4 shadow-sm"
                    >
                      {myProfileLoading ? (
                        <div className="flex flex-col items-center justify-center p-12">
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                          <p className="font-medium text-slate-500">Preparing comparison...</p>
                        </div>
                      ) : myProfile && (
                        <>
                          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                            <div className="text-left w-1/3">
                              <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">You</span>
                              <p className="font-bold text-slate-800 mt-2 truncate">{myProfile.name}</p>
                              <div className="flex gap-2 mt-1">
                                <Trophy className="w-3 h-3 text-amber-500" /> <span className="text-[10px] font-bold">{(myProfile.badgeCounts?.weekly?.gold || 0) + (myProfile.badgeCounts?.monthly?.gold || 0)}</span>
                                <Trophy className="w-3 h-3 text-slate-400" /> <span className="text-[10px] font-bold">{(myProfile.badgeCounts?.weekly?.silver || 0) + (myProfile.badgeCounts?.monthly?.silver || 0)}</span>
                                <Trophy className="w-3 h-3 text-orange-500" /> <span className="text-[10px] font-bold">{(myProfile.badgeCounts?.weekly?.bronze || 0) + (myProfile.badgeCounts?.monthly?.bronze || 0)}</span>
                              </div>
                            </div>
                            <div className="text-center w-1/3">
                              <Scale className="w-6 h-6 text-slate-300 mx-auto" />
                            </div>
                            <div className="text-right w-1/3">
                              <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Them</span>
                              <p className="font-bold text-slate-800 mt-2 truncate">{studentProfile.name}</p>
                              <div className="flex gap-2 mt-1 justify-end">
                                <Trophy className="w-3 h-3 text-amber-500" /> <span className="text-[10px] font-bold">{(studentProfile.badgeCounts?.weekly?.gold || 0) + (studentProfile.badgeCounts?.monthly?.gold || 0)}</span>
                                <Trophy className="w-3 h-3 text-slate-400" /> <span className="text-[10px] font-bold">{(studentProfile.badgeCounts?.weekly?.silver || 0) + (studentProfile.badgeCounts?.monthly?.silver || 0)}</span>
                                <Trophy className="w-3 h-3 text-orange-500" /> <span className="text-[10px] font-bold">{(studentProfile.badgeCounts?.weekly?.bronze || 0) + (studentProfile.badgeCounts?.monthly?.bronze || 0)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {renderComparisonStat("Total Exams", myProfile.totalExams, studentProfile.totalExams, true)}
                            {renderComparisonStat("Average Score", myProfile.avgScore, studentProfile.avgScore, true)}
                            {renderComparisonStat("Easy Exams", myProfile.easyExams, studentProfile.easyExams, true)}
                            {renderComparisonStat("Medium Exams", myProfile.mediumExams, studentProfile.mediumExams, true)}
                            {renderComparisonStat("Hard Exams", myProfile.hardExams, studentProfile.hardExams, true)}
                          </div>

                          <div className="mt-8 text-center">
                            <Button variant="ghost" onClick={() => setIsComparing(false)} className="text-slate-500 font-bold">
                              Back to Profile
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-500">Failed to load profile.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
