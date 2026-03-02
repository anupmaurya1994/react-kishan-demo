import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Plus, Send, Clock, BookOpen, Sparkles, RefreshCw } from "lucide-react";

interface Question {
    id: string;
    text: string;
    marks: number;
    type?: string;
    difficulty: string;
    options?: string[];
    answer?: string;
    explanation?: string;
}

interface QuestionsListProps {
    questions: Question[];
    onEdit: (question: Question) => void;
    onDelete: (id: string) => void;
    onAddManual: () => void;
    onRegenerate: () => void;
    onPublish: () => void;
    isPublishing: boolean;
    isRegenerating?: boolean;
    publishStatus: string;
    timeLimit: number;
    topics: string;
}

export function QuestionsList({
    questions,
    onEdit,
    onDelete,
    onAddManual,
    onRegenerate,
    onPublish,
    isPublishing,
    isRegenerating,
    publishStatus,
    timeLimit,
    topics
}: QuestionsListProps) {
    return (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                                Generated Questions
                            </CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 font-medium">
                            Review and refine your AI-crafted content.
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onRegenerate}
                                disabled={isRegenerating}
                                className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-95"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onAddManual}
                                className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                Add Manual
                            </Button>
                            <Button
                                type="button"
                                onClick={onPublish}
                                disabled={isPublishing || publishStatus === 'Published'}
                                className={`rounded-full gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 ${publishStatus === 'Published'
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                            >
                                <Send className="h-4 w-4" />
                                {publishStatus === 'Published' ? 'Published' : 'Publish Exam'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Improved Metadata Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50 transition-all hover:bg-blue-50">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Total Time Limit</p>
                            <p className="text-sm font-bold text-blue-900">{timeLimit} Minutes</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-100/50 transition-all hover:bg-purple-50">
                        <div className="bg-purple-100 p-2 rounded-xl">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Exam Topics</p>
                            <p className="text-sm font-bold text-purple-900 truncate">{topics || "General"}</p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="overflow-x-auto h-full scrollbar-thin scrollbar-thumb-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[80px] text-xs font-bold uppercase tracking-wider text-slate-400 pl-6">ID</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Question</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Type</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Marks</TableHead>
                                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-400 pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {questions.map((q) => (
                                <TableRow
                                    key={q.id}
                                    className="cursor-pointer hover:bg-slate-50/50 transition-colors group border-b border-slate-50"
                                    onClick={() => onEdit(q)}
                                >
                                    <TableCell className="font-mono text-xs text-slate-400 pl-6">{q.id}</TableCell>
                                    <TableCell className="max-w-[300px] py-4">
                                        <p className="font-semibold text-slate-700 line-clamp-2 group-hover:text-primary transition-colors">{q.text}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600 border-0 font-medium">
                                            {q.type || "MCQ"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter ${q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                                            (q.difficulty === 'medium' || q.difficulty === 'Medium') ? 'bg-blue-50 text-blue-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                            {q.difficulty}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-900">{q.marks}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                                                onClick={(e) => { e.stopPropagation(); onEdit(q); }}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-50 transition-all"
                                                onClick={(e) => { e.stopPropagation(); onDelete(q.id); }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {questions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-medium italic">
                                        No questions generated yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                    Showing <span className="text-primary font-bold">{questions.length}</span> craftsmanship entries
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold" disabled>Prev</Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold">Next</Button>
                </div>
            </div>
        </Card>
    );
}
