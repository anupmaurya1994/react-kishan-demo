import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, BookOpen, AlertCircle, ChevronLeft } from "lucide-react";
import AppHeader from "./AppHeader";
import { toast } from "sonner";

export default function ChallengeView() {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const [examData, setExamData] = useState<any>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const savedData = sessionStorage.getItem("current_exam_data");
        if (savedData) {
            setExamData(JSON.parse(savedData));
        } else {
            toast.error("Exam link is invalid or expired.");
        }
    }, []);

    const handleSubmit = () => {
        setIsSubmitted(true);
        toast.success("Exam submitted successfully!");
    };

    if (!examData) {
        return (
            <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
                <Card className="max-w-md w-full text-center p-8 border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/20">
                    <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                    <CardTitle className="text-xl font-bold text-rose-900 dark:text-rose-100">Exam Not Found</CardTitle>
                    <CardDescription className="mt-2 text-rose-600 dark:text-rose-400">
                        This exam link may be invalid or the session has expired. Please check with your instructor.
                    </CardDescription>
                    <Button
                        className="mt-6 w-full rounded-xl"
                        variant="outline"
                        onClick={() => setLocation("/")}
                    >
                        Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
                <Card className="max-w-md w-full text-center p-10 shadow-2xl border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-slate-900 rounded-3xl">
                     <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Submission Complete!</CardTitle>
                    <CardDescription className="mt-4 text-slate-500 dark:text-slate-400 text-lg">
                        Your responses for <span className="font-bold text-slate-700 dark:text-slate-200">{examData.title}</span> have been recorded.
                    </CardDescription>
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-400 text-sm">
                        Results will be shared by your instructor soon.
                    </div>
                     <Button
                        className="mt-8 w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-emerald-200 dark:shadow-none"
                        onClick={() => setLocation("/")}
                    >
                        Return Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col transition-colors duration-300">
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                         <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{examData.title}</h1>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{examData.subject} Challenge</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-full">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-bold text-amber-900 dark:text-amber-100">{examData.timeLimit}:00 Remaining</span>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 px-6 font-bold"
                        >
                            Submit Exam
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                 <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Instructions</h2>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Welcome to the <strong>{examData.title}</strong> assessment. You will find {examData.questions.length} questions below.
                            Please read each question carefully and select the best answer. Do not refresh the page during the exam.
                        </p>
                         <div className="flex flex-wrap gap-2 mt-6">
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 px-3 py-1">Time: {examData.timeLimit} Min</Badge>
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 px-3 py-1">Mode: Full Assessment</Badge>
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 px-3 py-1">Questions: {examData.questions.length}</Badge>
                        </div>
                    </div>

                    <div className="space-y-6">
                         {examData.questions.map((q: any, index: number) => (
                            <Card key={q.id} className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 dark:hover:border-primary/40 transition-all duration-300">
                                <div className="bg-slate-50/50 dark:bg-slate-950/50 px-8 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Question {index + 1}</span>
                                    <Badge variant="outline" className="rounded-full border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">{q.marks} Marks</Badge>
                                </div>
                                 <CardContent className="p-8">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-8 leading-snug">
                                        {q.text}
                                    </h3>

                                    {q.options ? (
                                         <div className="grid gap-3">
                                            {q.options.map((opt: string, i: number) => (
                                                <button
                                                    key={i}
                                                    className="w-full text-left p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 transition-all group flex items-center gap-4 active:scale-[0.99]"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-primary/10 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                    <span className="text-slate-600 dark:text-slate-400 font-medium">{opt}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                         <textarea
                                            placeholder="Type your response here..."
                                            className="w-full min-h-[150px] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 focus:bg-white dark:focus:bg-slate-900 focus:border-primary/30 outline-none transition-all resize-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 text-foreground"
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                     <div className="flex flex-col items-center py-12 space-y-4">
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">End of Assessment</p>
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            className="rounded-full shadow-xl shadow-primary/20 dark:shadow-none px-12 h-14 text-lg font-extrabold bg-primary hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Submit All Responses
                        </Button>
                    </div>
                </div>
            </main>

             <footer className="py-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Powered by ExamAI Challenge Platform</p>
                </div>
            </footer>
        </div>
    );
}
