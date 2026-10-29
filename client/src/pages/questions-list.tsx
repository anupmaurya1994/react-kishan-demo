import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, GraduationCap, BookOpen, Clock, Tags, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { QuestionsList } from "@/components/QuestionsList";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const MOCK_QUESTIONS_POOL = [
  {
    text: "What is the primary purpose of a 'vector database' in AI applications?",
    marks: 1,
    options: [
      "To store high-dimensional embeddings for similarity search",
      "To store traditional relational data",
      "To manage user authentication",
      "To render 3D graphics"
    ],
    correctAnswer: 0,
    answer: "To store high-dimensional embeddings for similarity search",
    type: "MCQ",
    difficulty: "medium"
  },
  {
    text: "Which of these is a key benefit of using a RAG (Retrieval-Augmented Generation) architecture?",
    marks: 1,
    options: [
      "It eliminates the need for any LLM",
      "It allows the model to access private or up-to-date data without retraining",
      "It makes the system run without internet",
      "It reduces the token cost to zero"
    ],
    correctAnswer: 1,
    answer: "It allows the model to access private or up-to-date data without retraining",
    type: "MCQ",
    difficulty: "medium"
  },
  {
    text: "What does 'temperature' control in an LLM generation?",
    marks: 1,
    options: [
      "The physical heat of the server",
      "The speed of the response",
      "The randomness and creativity of the output",
      "The maximum number of tokens generated"
    ],
    correctAnswer: 2,
    answer: "The randomness and creativity of the output",
    type: "MCQ",
    difficulty: "medium"
  },
  {
    text: "In the context of embeddings, what does 'cosine similarity' measure?",
    marks: 1,
    options: [
      "The distance between two points in Euclidean space",
      "The angle between two vectors",
      "The number of identical words in two sentences",
      "The time taken to generate a response"
    ],
    correctAnswer: 1,
    answer: "The angle between two vectors",
    type: "MCQ",
    difficulty: "medium"
  }
];

export default function QuestionsListPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [examData, setExamData] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [publishStatus, setPublishStatus] = useState("Draft");
  const [isPublishedExam, setIsPublishedExam] = useState(false);
  const [serverSyncFailed, setServerSyncFailed] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch paginated questions from 'baked' (backend)
  const { data: paginatedData, isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/exams/${id}/questions`, currentPage, pageSize],
    queryFn: async () => {
      if (serverSyncFailed) return null;
      const token = localStorage.getItem("token");
      const res = await fetch(`https://react-kishan-demo.onrender.com/api/exams/${id}/questions?page=${currentPage}&limit=${pageSize}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (res.status === 404) {
        setServerSyncFailed(true);
        return null;
      }
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id && id !== "demo-id" && !serverSyncFailed,
    retry: false,
  });

  const totalItems = paginatedData?.pagination?.totalItems || (examData?.questions?.length || 0);
  const totalPages = paginatedData?.pagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;
  const questionsToDisplay = paginatedData?.success
    ? paginatedData.data
    : (examData?.questions || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Fetch full exam details from server (to avoid relying solely on sessionStorage)
  const { data: serverExamData } = useQuery({
    queryKey: [`/api/exams/${id}`],
    queryFn: async () => {
      if (id === "demo-id" || serverSyncFailed) return null;
      const token = localStorage.getItem("token");
      const res = await fetch(`https://react-kishan-demo.onrender.com/api/exams/${id}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (!res.ok) return null;
      const result = await res.json();
      return result.data;
    },
    enabled: !!id && id !== "demo-id" && !serverSyncFailed,
  });

  useEffect(() => {
    // Priority: 1. Server Data, 2. Session Storage
    if (serverExamData) {
      setExamData(serverExamData);
      sessionStorage.setItem("current_exam_data", JSON.stringify(serverExamData));
      
      if (serverExamData.status?.toUpperCase() === "PUBLISHED") {
        setIsPublishedExam(true);
        setPublishStatus("Published");
      } else {
        setPublishStatus(serverExamData.status || "Draft");
      }
      return;
    }

    const savedData = sessionStorage.getItem("current_exam_data");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setExamData(parsed);
      if (parsed.status?.toUpperCase() === "PUBLISHED") {
        setIsPublishedExam(true);
      }
      setPublishStatus(parsed.status === "PROCESSING" ? "Processing" : (parsed.status === "PUBLISHED" ? "Published" : (parsed.status || "Draft")));
    } else if (id !== "demo-id") {
      // If no session data and not a demo, we rely on the serverExamData query which is running
    } else {
      toast.error("No exam data found. Redirecting...");
      setLocation("/create-exam");
    }
  }, [serverExamData, id, setLocation]);

  // Status Polling Query
  const { data: statusData } = useQuery({
    queryKey: [`/api/exams/${id}/status`],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://react-kishan-demo.onrender.com/api/exams/${id}/status`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id && id !== "demo-id" && (examData?.status === "PROCESSING" || publishStatus === "Processing"),
    refetchInterval: (query) => (query.state.data?.data?.status === "PROCESSING" ? 3000 : false),
  });

  useEffect(() => {
    if (statusData?.success && statusData.data && examData) {
      const newStatus = statusData.data.status;
      if (newStatus !== examData.status) {
        const updated = { ...examData, status: newStatus };
        setExamData(updated);
        sessionStorage.setItem("current_exam_data", JSON.stringify(updated));
        if (newStatus !== "PROCESSING") {
          setPublishStatus(newStatus === "PUBLISHED" ? "Published" : "Draft");
          queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
        }
      }
    }
  }, [statusData, examData, id, queryClient]);

  const publishMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://react-kishan-demo.onrender.com/api/exams/${id}/publish`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to publish exam");
      }
      return data;
    },

    onSuccess: () => {
      sessionStorage.removeItem("current_exam_data");
      toast.success("Exam published successfully! 🎉");
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    },

    onError: (error: any) => {
      toast.error(error.message || "Publish failed. Please try again.");
    }
  });

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      // Questions are live-synced to the DB when locked or edited.
      // Simply sync the local fallback representation to sessionStorage for quick edits later.
      return { success: true, message: "Draft saved" };
    },

    onSuccess: () => {
      // Sync the latest exam data to session storage before leaving
      sessionStorage.setItem("current_exam_data", JSON.stringify(examData));
      toast.success("Draft saved successfully!");
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    },

    onError: (error) => {
      toast.error(error.message || "Draft save failed");
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://react-kishan-demo.onrender.com/api/exams/${id}/regenerate`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to trigger AI regeneration");
      return data;
    },
    onSuccess: () => {
      const updated = {
        ...examData,
        status: "PROCESSING",
        // Keep only locked questions, the rest will be replaced by newly generated ones
        questions: (examData?.questions || []).filter((q: any) => q.isLocked || q.isApproved)
      };
      setExamData(updated);
      sessionStorage.setItem("current_exam_data", JSON.stringify(updated));
      setPublishStatus("Processing");
      toast.success("AI Regeneration started!");

      // Invalidate questions query to show loading state if needed
      queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Regeneration failed");
    }
  });

  const getQId = (q: any): string => q.id || q._id || "";

  const handleDelete = async (questionId: string) => {
    try {
      if (questionId.length > 20 && !serverSyncFailed) {
        try {
          await apiRequest("DELETE", `/api/exams/questions/${questionId}`);
          queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
        } catch (err: any) {
          if (err.message?.includes("404")) setServerSyncFailed(true);
          console.warn("Backend delete failed, updating local state only", err);
        }
      }

      const updatedQuestions = (examData?.questions || []).filter(
        (q: any) => getQId(q) !== questionId
      );
      const updatedData = { ...examData, questions: updatedQuestions };
      setExamData(updatedData);
      sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
      toast.success("Question deleted");
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete question");
    }
  };

  const handleApprove = async (questionId: string) => {
    try {
      if (questionId.length > 20 && !serverSyncFailed) {
        try {
          await apiRequest("PUT", `/api/exams/questions/${questionId}`, { isApproved: true });
          queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
        } catch (err: any) {
          if (err.message?.includes("404")) setServerSyncFailed(true);
          console.warn("Backend update failed, updating local state only", err);
        }
      }

      const updatedQuestions = (examData?.questions || []).map((q: any) =>
        getQId(q) === questionId ? { ...q, isLocked: true, isApproved: true } : q
      );
      const updatedData = { ...examData, questions: updatedQuestions };
      setExamData(updatedData);
      sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
      toast.success("Question locked! 🔒");
    } catch (error: any) {
      console.error("Lock failed:", error);
      toast.error(error.message || "Failed to lock question");
    }
  };

  const handleApproveAll = async () => {
    try {
      if (!serverSyncFailed) {
        try {
          await apiRequest("PATCH", `/api/exams/${id}/approve-all`, { isApproved: true });
          queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
        } catch (err: any) {
          if (err.message?.includes("404")) setServerSyncFailed(true);
          console.warn("Backend update failed, updating local state only", err);
        }
      }

      const updatedQuestions = (examData?.questions || []).map((q: any) => ({ ...q, isLocked: true, isApproved: true }));
      const updatedData = { ...examData, questions: updatedQuestions };
      setExamData(updatedData);
      sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
      toast.success("All questions locked! 🔒");
    } catch (error: any) {
      console.error("Bulk lock failed:", error);
      toast.error("Failed to lock all questions");
    }
  };

  const handleUnlockAll = async () => {
    try {
      if (!serverSyncFailed) {
        try {
          await apiRequest("PATCH", `/api/exams/${id}/approve-all`, { isApproved: false });
          queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
        } catch (err: any) {
          if (err.message?.includes("404")) setServerSyncFailed(true);
          console.warn("Backend update failed, updating local state only", err);
        }
      }

      const updatedQuestions = (examData?.questions || []).map((q: any) => ({ ...q, isLocked: false, isApproved: false }));
      const updatedData = { ...examData, questions: updatedQuestions };
      setExamData(updatedData);
      sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
      toast.success("All questions unlocked! 🔓");
    } catch (error: any) {
      console.error("Bulk unlock failed:", error);
      toast.error("Failed to unlock all questions");
    }
  };

  const handleUnlock = async (questionId: string) => {
    if (questionId.length > 20 && !serverSyncFailed) {
      try {
        await apiRequest("PUT", `/api/exams/questions/${questionId}`, { isApproved: false });
        queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
      } catch (error: any) {
        if (error.message?.includes("404")) setServerSyncFailed(true);
        console.warn("Backend unlock failed, updating local state only", error);
      }
    }

    const updatedQuestions = (examData?.questions || []).map((q: any) =>
      getQId(q) === questionId ? { ...q, isLocked: false, isApproved: false } : q
    );
    const updatedData = { ...examData, questions: updatedQuestions };
    setExamData(updatedData);
    sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
    toast.success("Question unlocked");
  };

  const handleAddManual = () => {
    const newId = ((examData?.questions?.length || 0) + 1).toString();

    const newQuestion = {
      id: newId,
      text: "",
      marks: 1,
      options: ["", "", "", ""],
      correctAnswer: -1,
      answer: "",
      type: "MCQ",
      difficulty: "medium",
      isLocked: false,
    };

    // Only open modal
    setSelectedQuestion(newQuestion);
  };

  const handleSaveNewQuestion = async (newQ: any) => {
    try {
      let savedQuestion = newQ;
      
      if (!serverSyncFailed) {
        const response = await apiRequest("POST", `/api/exams/${id}/questions/manual`, newQ);
        if (response.success && response.data) {
          savedQuestion = response.data;
          // Invalidate to get fresh count and data
          await queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
          
          // Calculate if we need to move to the last page
          const newTotal = totalItems + 1;
          const lastPage = Math.ceil(newTotal / pageSize);
          if (lastPage > currentPage) {
            setCurrentPage(lastPage);
          }
        }
      }

      // Update local fallback state
      const updatedQuestions = [...(examData?.questions || []), savedQuestion];
      const updatedData = { ...examData, questions: updatedQuestions };

      setExamData(updatedData);
      sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));

      setSelectedQuestion(null);
      toast.success("Question added successfully! Moved to last page.");
    } catch (error: any) {
      console.error("Failed to add manual question:", error);
      toast.error(error.message || "Failed to save question to server");
    }
  };

  const handleUpdateQuestion = async (updatedQ: any) => {
    const qId = getQId(updatedQ);

    if (qId.length > 20) {
      try {
        await apiRequest("PUT", `/api/exams/questions/${qId}`, updatedQ);
        queryClient.invalidateQueries({ queryKey: [`/api/exams/${id}/questions`] });
      } catch (error) {
        console.error("Update failed:", error);
      }
    }

    const updatedQuestions = (examData?.questions || []).map((q: any) =>
      getQId(q) === qId ? updatedQ : q
    );
    const updatedData = { ...examData, questions: updatedQuestions };
    setExamData(updatedData);
    sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
    toast.success("Question updated");
  };

  if (!examData) return null;

  return (
    <>
      <div className="bg-background dark:bg-slate-950 flex flex-col font-inter min-h-screen transition-colors duration-300">

        {/* EXAM INFO CARD */}
        <div className="container mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="p-8 rounded-3xl shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mb-8 border-0 dark:border dark:border-slate-800/50 relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-6 flex-1 w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight capitalize">
                    {examData.title}
                  </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 hover:border-primary/20 hover:bg-white dark:hover:bg-slate-900/40 transition-all duration-300">
                    <div className="bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-xl">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Subject</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-100 capitalize">{examData.subject}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 hover:border-primary/20 hover:bg-white dark:hover:bg-slate-900/40 transition-all duration-300">
                    <div className="bg-amber-100/50 dark:bg-amber-900/30 p-2 rounded-xl">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Timing Type</span>
                      <Select
                        value={examData.timeLimitType || "overall"}
                        onValueChange={(val) => {
                          const updated = { ...examData, timeLimitType: val };
                          setExamData(updated);
                          sessionStorage.setItem("current_exam_data", JSON.stringify(updated));
                        }}
                      >
                        <SelectTrigger className="h-6 border-none bg-transparent p-0 font-semibold text-slate-700 dark:text-slate-100 focus:ring-0 hover:text-primary transition-colors">
                          <SelectValue>
                            {examData.timeLimit} {examData.timeLimitType === 'per-question' ? 'Min / Question' : 'Minutes Total'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-popover dark:bg-slate-950/95 backdrop-blur-xl">
                          <SelectItem value="overall">{examData.timeLimit} Minutes Total</SelectItem>
                          <SelectItem value="per-question">{examData.timeLimit} Min / Question</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 hover:border-primary/20 hover:bg-white dark:hover:bg-slate-900/40 transition-all duration-300">
                    <div className="bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded-xl">
                      <Tags className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Topics</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-100 truncate max-w-[150px]" title={examData.topics}>{examData.topics}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="group/btn h-12 px-6 rounded-2xl border-slate-200 dark:border-slate-800/80 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 shadow-sm active:scale-95 shrink-0 bg-white dark:bg-slate-950/50 text-slate-700 dark:text-slate-100 font-bold"
                onClick={() => {
                  if (examData) {
                    sessionStorage.setItem("current_exam_data", JSON.stringify({
                      ...examData,
                      // Preserve published state even if status changed to PROCESSING after regeneration
                      wasPublished: isPublishedExam || examData.status?.toUpperCase() === "PUBLISHED"
                    }));
                  }
                  sessionStorage.setItem("isEditingExam", "true");
                  setLocation("/create-exam");
                }}
              >
                <Edit3 className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500 group-hover/btn:text-primary transition-colors" />
                <span>Edit Exam Info</span>
              </Button>
            </div>
          </Card>

          {/* QUESTIONS LIST */}
          <QuestionsList
            questions={questionsToDisplay}
            onUpdate={handleUpdateQuestion}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onApproveAll={handleApproveAll}
            onUnlockAll={handleUnlockAll}
            onUnlock={handleUnlock}
            onAddManual={handleAddManual}
            onRegenerate={() => regenerateMutation.mutate()}
            isRegenerating={regenerateMutation.isPending}
            onPublish={() => publishMutation.mutate()}
            isPublishing={publishMutation.isPending}
            onSaveDraft={isPublishedExam ? undefined : () => saveDraftMutation.mutate()}
            isDraftSaving={isPublishedExam ? false : saveDraftMutation.isPending}
            publishStatus={examData.status}
            timeLimit={examData.timeLimit}
            topics={examData.topics}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1); // Reset to first page when changing size
            }}
          />
        </div>

        {/* EDIT QUESTION DRAWER */}
        <Sheet
          open={!!selectedQuestion}
          onOpenChange={() => setSelectedQuestion(null)}
        >
          <SheetContent className="w-[500px] overflow-y-auto bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            {selectedQuestion && (
              <div className="py-6 space-y-6">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold text-foreground">
                    Edit Question {selectedQuestion.id}
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-4">

                  <div>
                    <Label className="text-slate-700 dark:text-slate-300">Question Text</Label>
                    <Textarea
                      value={selectedQuestion.text}
                      onChange={(e) =>
                        setSelectedQuestion({
                          ...selectedQuestion,
                          text: e.target.value,
                        })
                      }
                      className="min-h-[120px] bg-background dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-700 dark:text-slate-300">Options</Label>
                    {selectedQuestion.options?.map((opt: string, i: number) => (
                      <div key={i} className="flex gap-2 mt-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...selectedQuestion.options];
                            newOpts[i] = e.target.value;
                            setSelectedQuestion({
                              ...selectedQuestion,
                              options: newOpts,
                            });
                          }}
                          className="bg-background dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                        />
                        <Button
                          variant={
                            i === selectedQuestion.correctAnswer
                              ? "default"
                              : "outline"
                          }
                          className={i === selectedQuestion.correctAnswer ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          onClick={() =>
                            setSelectedQuestion({
                              ...selectedQuestion,
                              correctAnswer: i,
                              answer: opt,
                            })
                          }
                        >
                          {i === selectedQuestion.correctAnswer ? "Correct" : "Mark"}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Marks</Label>
                      <Input
                        type="number"
                        value={selectedQuestion.marks}
                        onChange={(e) =>
                          setSelectedQuestion({
                            ...selectedQuestion,
                            marks: parseInt(e.target.value),
                          })
                        }
                        className="bg-background dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={selectedQuestion.difficulty}
                        onValueChange={(v) =>
                          setSelectedQuestion({
                            ...selectedQuestion,
                            difficulty: v,
                          })
                        }
                      >
                        <SelectTrigger className="bg-background dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      // Validation
                      if (!selectedQuestion.text?.trim()) {
                        return toast.error("Please enter the question text");
                      }
                      if (selectedQuestion.options?.some((opt: string) => !opt?.trim())) {
                        return toast.error("Please fill in all 4 options");
                      }
                      if (selectedQuestion.correctAnswer === -1 || selectedQuestion.correctAnswer === undefined) {
                        return toast.error("Please select the correct answer");
                      }

                      const exists = (examData?.questions || []).some(
                        (q: any) => q.id === selectedQuestion.id
                      );

                      if (exists) {
                        handleUpdateQuestion(selectedQuestion);
                      } else {
                        handleSaveNewQuestion(selectedQuestion);
                      }
                    }}
                  >
                    {(examData?.questions || []).some((q: any) => q.id === selectedQuestion.id)
                      ? "Save Changes"
                      : "Add Question"}
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}