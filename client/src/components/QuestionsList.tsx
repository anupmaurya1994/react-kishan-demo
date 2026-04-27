import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Plus, Send, Clock, BookOpen, Sparkles, RefreshCw, ChevronDown, Save, X, CheckCircle2, Lock, Unlock, LayoutList } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface Question {
    id?: string;
    _id?: string;
    text: string;
    marks: number;
    type?: string;
    difficulty: string;
    options?: string[];
    answer?: string;
    explanation?: string;
    isLocked?: boolean;
    isApproved?: boolean;
}

interface QuestionsListProps {
    questions: Question[];
    onUpdate: (question: Question) => void;
    onDelete: (id: string) => void;
    onApprove: (id: string) => void;
    onApproveAll?: () => void;
    onUnlockAll?: () => void;
    onUnlock: (id: string) => void;
    onAddManual: () => void;
    onRegenerate: () => void;
    onPublish: () => void;
    isPublishing: boolean;
    onSaveDraft?: () => void;
    isDraftSaving?: boolean;
    isRegenerating?: boolean;
    publishStatus: string;
    timeLimit: number;
    topics: string;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function QuestionsList({
    questions,
    onUpdate,
    onDelete,
    onApprove,
    onApproveAll,
    onUnlockAll,
    onUnlock,
    onAddManual,
    onRegenerate,
    onPublish,
    isPublishing,
    onSaveDraft,
    isDraftSaving,
    isRegenerating,
    publishStatus,
    timeLimit,
    topics,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange
}: QuestionsListProps) {
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Question | null>(null);
    const [activeTab, setActiveTab] = useState<string>("all");

    const getQId = (q: Question): string => q.id || q._id || "";
    const isQLocked = (q: Question): boolean => !!(q.isLocked || q.isApproved);

    const filteredQuestions = questions.filter(q => {
        if (activeTab === "locked") return isQLocked(q);
        if (activeTab === "unlocked") return !isQLocked(q);
        return true;
    });

    const allLocked = questions.length > 0 && questions.every(q => isQLocked(q));

    const handleToggleExpand = (q: Question) => {
        if (isQLocked(q)) return; // Prevent expansion if locked
        const questionId = getQId(q);
        if (expandedQuestionId === questionId) {
            setExpandedQuestionId(null);
            setEditData(null);
        } else {
            setExpandedQuestionId(questionId);
            setEditData({ ...q });
        }
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editData) {
            onUpdate(editData);
            setExpandedQuestionId(null);
            setEditData(null);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedQuestionId(null);
        setEditData(null);
    };

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
                                {isRegenerating ? <Spinner className="size-4" /> : <RefreshCw className="h-4 w-4" />}
                                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={allLocked ? onUnlockAll : onApproveAll}
                                className={`rounded-full gap-2 transition-all active:scale-95 ${allLocked
                                    ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {allLocked ? 'Unlock All' : 'Lock All'}
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
                            {onSaveDraft && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onSaveDraft}
                                    disabled={isDraftSaving}
                                    className="rounded-full gap-2 border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    <Save className="h-4 w-4" />
                                    {isDraftSaving ? 'Saving...' : 'Save Draft'}
                                </Button>
                            )}
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

                {/* Tabs for Filtering */}
                <div className="mt-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                            <TabsTrigger
                                value="all"
                                className="rounded-xl px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                <LayoutList className="h-4 w-4" />
                                <span className="font-semibold">All</span>
                                <Badge variant="secondary" className="ml-1 bg-slate-200/50 text-slate-600 border-0">{questions.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="locked"
                                className="rounded-xl px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all"
                            >
                                <Lock className="h-4 w-4" />
                                <span className="font-semibold">Locked</span>
                                <Badge variant="secondary" className="ml-1 bg-emerald-100/50 text-emerald-600 border-0 font-bold">
                                    {questions.filter(q => isQLocked(q)).length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="unlocked"
                                className="rounded-xl px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all"
                            >
                                <Unlock className="h-4 w-4" />
                                <span className="font-semibold">Unlocked</span>
                                <Badge variant="secondary" className="ml-1 bg-amber-100/50 text-amber-600 border-0 font-bold">
                                    {questions.filter(q => !isQLocked(q)).length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="overflow-x-auto h-full scrollbar-thin scrollbar-thumb-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[60px] text-xs font-bold uppercase tracking-wider text-slate-400 pl-6"></TableHead>
                                <TableHead className="w-[80px] text-xs font-bold uppercase tracking-wider text-slate-400">ID</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Question</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Type</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Marks</TableHead>
                                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-400 pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuestions.map((q) => {
                                const questionId = getQId(q);
                                const qLocked = isQLocked(q);
                                const isExpanded = expandedQuestionId === questionId;
                                return (
                                    <React.Fragment key={questionId}>
                                        <TableRow
                                            className={`cursor-pointer transition-all duration-200 group border-b border-slate-50 ${isExpanded ? 'bg-primary/5 shadow-inner' : 'hover:bg-slate-50/50'}`}
                                            onClick={() => handleToggleExpand(q)}
                                        >
                                            <TableCell className="pl-6 py-4">
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDown className={`h-5 w-5 ${isExpanded ? 'text-primary' : 'text-slate-300'}`} />
                                                </motion.div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-400">{questionId}</TableCell>
                                            <TableCell className="max-w-[400px] py-4">
                                                <p className={`font-semibold transition-colors ${isExpanded ? 'text-primary' : 'text-slate-700 line-clamp-1 group-hover:text-primary'}`}>
                                                    {q.text}
                                                </p>
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
                                                    {!qLocked && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full text-emerald-500 hover:bg-emerald-50 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); onApprove(questionId); }}
                                                            title="Approve Question"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {qLocked && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-emerald-50 text-emerald-600 border-emerald-100 gap-1 rounded-full px-2 py-0.5 mr-2 cursor-pointer hover:bg-emerald-100 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); onUnlock(questionId); }}
                                                            title="Click to Unlock"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" /> Locked
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-50 transition-all"
                                                        onClick={(e) => { e.stopPropagation(); onDelete(questionId); }}
                                                        title="Delete Question"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <TableRow className="hover:bg-transparent border-0">
                                                    <TableCell colSpan={7} className="p-0 border-0 overflow-hidden">
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                            className="bg-slate-50/50 p-6 border-b border-primary/10"
                                                        >
                                                            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8 animate-in zoom-in-95 duration-300">
                                                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                                            <Edit2 className="h-5 w-5 text-primary" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-lg font-bold text-slate-900">Edit Question Detail</h4>
                                                                            <p className="text-sm text-slate-500">Refine the content for this item</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button variant="ghost" size="sm" onClick={handleCancel} className="rounded-full gap-2 text-slate-400 hover:text-slate-600">
                                                                            <X className="h-4 w-4" /> Cancel
                                                                        </Button>
                                                                        <Button onClick={handleSave} size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20">
                                                                            <Save className="h-4 w-4" /> Save Changes
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {editData && (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                        <div className="space-y-6 lg:border-r lg:border-slate-100 lg:pr-8">
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Question Statement</Label>
                                                                                <Textarea
                                                                                    value={editData.text}
                                                                                    onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                                                                                    placeholder="Enter question text here..."
                                                                                    className="min-h-[140px] rounded-2xl border-slate-200 focus:border-primary focus:ring-primary/10 text-slate-700 font-medium leading-relaxed"
                                                                                />
                                                                            </div>

                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                                <div className="space-y-2">
                                                                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Difficulty</Label>
                                                                                    <Select value={editData.difficulty} onValueChange={(v) => setEditData({ ...editData, difficulty: v })}>
                                                                                        <SelectTrigger className="rounded-xl border-slate-200">
                                                                                            <SelectValue />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            <SelectItem value="easy">Easy</SelectItem>
                                                                                            <SelectItem value="medium">Medium</SelectItem>
                                                                                            <SelectItem value="hard">Hard</SelectItem>
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Marks</Label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={editData.marks}
                                                                                        onChange={(e) => setEditData({ ...editData, marks: parseInt(e.target.value) })}
                                                                                        className="rounded-xl border-slate-200"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-6">
                                                                            <div className="space-y-3">
                                                                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Options & Correct Answer</Label>
                                                                                {editData.options?.map((opt, i) => {
                                                                                    const isCorrect = opt === editData.answer;
                                                                                    return (
                                                                                        <div key={i} className={`group relative flex items-center gap-3 p-1 rounded-2xl border-2 transition-all ${isCorrect ? 'border-emerald-500/30 bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}>
                                                                                            <Input
                                                                                                value={opt}
                                                                                                onChange={(e) => {
                                                                                                    const nextOptions = [...(editData.options || [])];
                                                                                                    const oldVal = nextOptions[i];
                                                                                                    nextOptions[i] = e.target.value;
                                                                                                    const nextEditData = { ...editData, options: nextOptions };
                                                                                                    if (oldVal === editData.answer) nextEditData.answer = e.target.value;
                                                                                                    setEditData(nextEditData);
                                                                                                }}
                                                                                                className="border-0 bg-transparent focus-visible:ring-0 text-sm font-medium text-slate-700 h-10 px-4"
                                                                                            />
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                onClick={() => setEditData({ ...editData, answer: opt })}
                                                                                                className={`h-8 px-3 rounded-xl transition-all ${isCorrect ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600' : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 opacity-60'}`}
                                                                                            >
                                                                                                <CheckCircle2 className={`h-4 w-4 mr-1.5 ${isCorrect ? 'animate-in zoom-in-50' : ''}`} />
                                                                                                {isCorrect ? 'Correct' : 'Mark Correct'}
                                                                                            </Button>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Explanation (Optional)</Label>
                                                                                <Textarea
                                                                                    value={editData.explanation || ""}
                                                                                    onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
                                                                                    placeholder="Why is this the correct answer?"
                                                                                    className="min-h-[100px] rounded-2xl border-slate-200 text-sm italic text-slate-600 bg-blue-50/30"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                );
                            })}
                            {filteredQuestions.length === 0 && (
                                <TableRow key="empty-row">
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-400 font-medium italic">
                                        No questions found in this category.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <p className="text-xs font-medium text-slate-500">
                        Showing <span className="text-primary font-bold">{Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-primary font-bold">{totalItems}</span> craftsmanship entries
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Rows per page:</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(v) => onPageSizeChange(parseInt(v))}
                        >
                            <SelectTrigger className="h-8 w-20 text-xs rounded-xl bg-white border-slate-200">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl text-xs font-bold"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl text-xs font-bold"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Card>
    );
}
