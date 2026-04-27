import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrainCircuit, ChevronLeft, ChevronRight, Upload, Sparkles, Save, Edit2, Trash2, RefreshCw, Eye, Search, Filter, FileText, AlertCircle, Plus, Send } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import AppHeader from "./AppHeader";
import { Spinner } from "@/components/ui/spinner";

const examSchema = z.object({
  title: z.string().min(1, "Exam title is required"),
  subject: z.string().min(1, "Subject is required"),
  difficulty: z.string().min(1, "Difficulty level is required"),
  description: z.string().optional(),
  questionCount: z.coerce.number().min(1, "Minimum 1 question required").max(50, "Maximum 50 questions allowed"),
  topics: z.string().min(1, "Important topics are required"),
  timeLimit: z.coerce.number().min(1, "Minimum 1 minute allowed").max(480, "Maximum 480 minutes allowed"),
  timeLimitType: z.string().min(1, "Time limit type is required"),
});

type ExamFormValues = z.infer<typeof examSchema>;

const MOCK_QUESTIONS = [
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

export default function CreateExam() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("Draft");
  const [publishStatus, setPublishStatus] = useState("Pending");
  const [isPublishedExam, setIsPublishedExam] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<{ originalName: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formKey, setFormKey] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    reset,
    formState: { errors, isValid },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      questionCount: "" as any,
      topics: "",
      timeLimit: "" as any,
      difficulty: "",
      timeLimitType: "",
    },
  })

  useEffect(() => {
    // Always check the stored exam status on mount (handles all navigation paths)
    const savedData = sessionStorage.getItem("current_exam_data");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Check both current status AND wasPublished flag (set when editing a published exam)
      if (parsed.status?.toUpperCase() === "PUBLISHED" || parsed.wasPublished === true) {
        setIsPublishedExam(true);
      }
    }

    const isEditing = sessionStorage.getItem("isEditingExam");

    if (isEditing === "true") {
      if (savedData) {
        const parsed = JSON.parse(savedData);

        reset({
          title: parsed.title || "",
          subject: parsed.subject || "",
          topics: Array.isArray(parsed.topics) ? parsed.topics.join(", ") : (parsed.topics || ""),
          timeLimit: parsed.timeLimit || 60,
          timeLimitType: parsed.timeLimitType || "overall",
          difficulty: parsed.difficulty?.toLowerCase() || "medium",
          description: parsed.description || "",
          questionCount: parsed.numberOfQuestions || parsed.questions?.length || 4,
        });

        if (parsed.status) {
          setStatus(parsed.status);
        }

        // Force Radix Select to remount with the correct value
        setFormKey(k => k + 1);

        if (parsed.files && parsed.files.length > 0) {
          setExistingFiles(parsed.files);
        }

        if (parsed.questions && parsed.questions.length > 0) {
          setGeneratedQuestions(parsed.questions);
        }
      }
      sessionStorage.removeItem("isEditingExam");
    } else {
      // RESET everything for a truly new exam
      reset({
        title: "",
        subject: "",
        description: "",
        questionCount: "" as any,
        topics: "",
        timeLimit: "" as any,
        difficulty: "",
        timeLimitType: "",
      });
      setStatus("Draft");
      setExistingFiles([]);
      setGeneratedQuestions([]);
      setIsPublishedExam(false);
      setSelectedFiles([]);
    }
  }, [reset]);

  const handleGoToQuestions = () => {
    const savedStr = sessionStorage.getItem("current_exam_data");
    const savedData = savedStr ? JSON.parse(savedStr) : null;
    const id = savedData?._id || "demo-id";
    setLocation(`/exams/${id}/questions`);
  };

  const mutation = useMutation({
    mutationFn: async (values: ExamFormValues) => {
      const savedStr = sessionStorage.getItem("current_exam_data");
      const savedData = savedStr ? JSON.parse(savedStr) : null;
      let examId = savedData?._id;

      // 1. Update/Create Exam Details and upload files
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subject", values.subject);
      formData.append("topics", JSON.stringify(values.topics.includes('[') ? JSON.parse(values.topics) : values.topics.split(',').map((t: string) => t.trim())));
      formData.append("timeLimit", values.timeLimit.toString());
      formData.append("timeLimitType", values.timeLimitType);
      formData.append("difficulty", values.difficulty);
      if (values.description) formData.append("description", values.description);
      formData.append("numberOfQuestions", values.questionCount.toString());

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const token = localStorage.getItem("token");
      const saveUrl = examId ? `/api/exams/${examId}` : "/api/exams/create";
      const saveMethod = examId ? "PUT" : "POST";

      const saveRes = await fetch(saveUrl, {
        method: saveMethod,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const apiSaveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(apiSaveData.message || "Failed to save exam details");
      }

      examId = apiSaveData.data?._id || examId;

      // 2. Trigger AI Generation (Regenerate to clear old ones)
      const genRes = await fetch(`/api/exams/${examId}/regenerate`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        throw new Error(genData.message || "AI generation failed to start");
      }

      return { examId, values, apiData: apiSaveData.data };
    },
    onSuccess: ({ examId, values, apiData }) => {
      const savedStr = sessionStorage.getItem("current_exam_data");
      const savedData = savedStr ? JSON.parse(savedStr) : null;

      const updatedExamData: any = {
        ...savedData,
        ...apiData,
        title: values.title,
        subject: values.subject,
        difficulty: values.difficulty,
        timeLimit: values.timeLimit,
        timeLimitType: values.timeLimitType,
        topics: values.topics,
        description: values.description,
        numberOfQuestions: values.questionCount,
        // Keep only locked/approved questions, clear the rest as they'll be replaced by AI
        questions: (savedData?.questions || []).filter((q: any) => q.isLocked || q.isApproved),
        status: "PROCESSING" // AI is now working
      };

      sessionStorage.setItem("current_exam_data", JSON.stringify(updatedExamData));

      setGeneratedQuestions([]); // Clear local questions as they are being replaced
      setStatus("Processing");
      toast.success("AI Generation started! Redirecting...");

      // Navigate to the questions list page where polling/status can be checked
      setTimeout(() => {
        setLocation(`/exams/${examId}/questions`);
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(error.message);
      setStatus("Draft");
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (values: ExamFormValues) => {
      const savedStr = sessionStorage.getItem("current_exam_data");
      const savedData = savedStr ? JSON.parse(savedStr) : null;
      const examId = savedData?._id;

      const formData = new FormData();
      formData.append("title", values.title || "Untitled Draft");
      formData.append("subject", values.subject || "Uncategorized");
      formData.append("topics", JSON.stringify(values.topics ? values.topics.split(',').map(t => t.trim()) : []));
      formData.append("timeLimit", (values.timeLimit || 60).toString());
      formData.append("timeLimitType", values.timeLimitType);
      formData.append("difficulty", values.difficulty || "");
      if (values.description) formData.append("description", values.description);
      formData.append("numberOfQuestions", (values.questionCount || 4).toString());

      const currentStatus = (generatedQuestions && generatedQuestions.length > 0) ? "REVIEW" : "Draft";
      formData.append("status", currentStatus);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const token = localStorage.getItem("token");
      const url = examId ? `/api/exams/${examId}` : "/api/exams/create";
      const method = examId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save draft");
      }
      return { apiData: data, examId, values, savedData };
    },
    onSuccess: ({ apiData, examId, values, savedData }) => {
      toast.success("Draft saved successfully!");

      const newFiles = [...existingFiles, ...selectedFiles.map(f => ({ originalName: f.name }))];

      const updatedData = {
        ...(savedData || {}),
        title: values.title,
        subject: values.subject,
        difficulty: values.difficulty,
        timeLimit: values.timeLimit,
        timeLimitType: values.timeLimitType,
        topics: values.topics,
        description: values.description,
        numberOfQuestions: values.questionCount,
        files: newFiles
      };

      if (apiData.data && apiData.data._id) {
        updatedData._id = apiData.data._id;
      }

      sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));

      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save draft");
    },
  });

  // const publishMutation = useMutation({
  //   mutationFn: async () => {
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     return { success: true };
  //   },
  //   onSuccess: () => {
  //     setPublishStatus("Published");
  //     toast.success("Exam published successfully!");
  //   },
  // });

  const handleGenerate = (values: ExamFormValues) => {
    setStatus("Processing");
    mutation.mutate(values);
  };

  const handleSaveDraft = () => {
    const values = getValues();

    if (!values.title) {
      toast.error("Please provide an Exam Title before saving a draft.");
      return;
    }

    const qCount = Number(values.questionCount);
    if (!values.questionCount || isNaN(qCount) || qCount < 1) {
      toast.error("Number of Questions must be at least 1.");
      return;
    }

    const tLimit = Number(values.timeLimit);
    if (!values.timeLimit || isNaN(tLimit) || tLimit < 1) {
      toast.error("Time Limit must be at least 1 minute.");
      return;
    }

    saveDraftMutation.mutate(values);
  };

  const handleAddManual = () => {
    const newId = (generatedQuestions.length + 1).toString();
    const newQuestion = {
      id: newId,
      text: "New Question Text",
      marks: 1,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      answer: "Option A",
      type: "MCQ",
      difficulty: "medium"
    };
    setGeneratedQuestions([...generatedQuestions, newQuestion]);
    setSelectedQuestion(newQuestion);
    toast.info("Added new manual question holder");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const allowedExtensions = ["pdf", "docx", "doc", "jpg", "jpeg", "png"];

      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      files.forEach(file => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext && allowedExtensions.includes(ext)) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });

      if (invalidFiles.length > 0) {
        toast.error(`Unsupported files: ${invalidFiles.join(", ")}. Please upload PDF, DOCX, or Images.`);
      }

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const isGenerating = mutation.isPending;

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-slate-50/50 flex flex-col">

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setLocation("/dashboard")}
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            {generatedQuestions.length > 0 && (
              <Button
                variant="ghost"
                type="button"
                onClick={handleGoToQuestions}
                className="text-primary hover:text-primary/80 hover:bg-primary/5 transition-colors font-semibold"
              >
                Continue to Questions
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit(handleGenerate)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section */}
            <div className={`${showQuestions ? 'lg:col-span-4' : 'lg:col-span-8 lg:col-start-3'} space-y-6 transition-all duration-500`}>
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                  <CardTitle className="text-xl font-bold">Exam Details</CardTitle>
                  <CardDescription>Configure your exam parameters and upload source materials.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label className={errors.title ? "text-destructive" : ""}>Exam Title</Label>
                    <Input
                      {...register("title")}
                      placeholder="e.g. Midterm Biology 101"
                      className={`rounded-xl ${errors.title ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      data-testid="input-exam-title"
                    />
                    {errors.title && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.title.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={errors.subject ? "text-destructive" : ""}>Subject</Label>
                      <Input
                        {...register("subject")}
                        placeholder="e.g. Biology"
                        className={`rounded-xl ${errors.subject ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        data-testid="input-subject"
                      />
                      {errors.subject && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.subject.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className={errors.difficulty ? "text-destructive" : ""}>Difficulty Level</Label>
                      <Controller
                        key={formKey}
                        name="difficulty"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.difficulty && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.difficulty.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={errors.description ? "text-destructive" : ""}>Description</Label>
                    <Textarea
                      {...register("description")}
                      placeholder="Instructions for students..."
                      className={`rounded-xl min-h-[100px] ${errors.description ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.description && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.description.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className={errors.questionCount ? "text-destructive" : ""}>Number of Questions</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register("questionCount")}
                        placeholder="20"
                        onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                        className={`rounded-xl ${errors.questionCount ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.questionCount && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.questionCount.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className={errors.timeLimit ? "text-destructive" : ""}>Time Limit (Value)</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register("timeLimit")}
                        placeholder="60"
                        onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                        className={`rounded-xl ${errors.timeLimit ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.timeLimit && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.timeLimit.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className={errors.timeLimitType ? "text-destructive" : ""}>Time Limit Type</Label>
                      <Controller
                        key={formKey}
                        name="timeLimitType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className={`rounded-xl ${errors.timeLimitType ? "border-destructive focus:ring-destructive" : ""}`}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="overall">Minutes Total</SelectItem>
                              <SelectItem value="per-question">Min / Question</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.timeLimitType && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.timeLimitType.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={errors.topics ? "text-destructive" : ""}>Important Topics (Tags)</Label>
                    <Input
                      {...register("topics")}
                      placeholder="Cell Biology, Genetics, Evolution..."
                      className={`rounded-xl ${errors.topics ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.topics && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.topics.message}</p>}
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label>Upload Study Materials</Label>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.doc,image/*"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${(selectedFiles.length > 0 || existingFiles.length > 0) ? 'border-primary/50 bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-primary/5'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 ${(selectedFiles.length > 0 || existingFiles.length > 0) ? 'bg-primary/20' : 'bg-slate-100'}`}>
                        <Upload className={`h-6 w-6 ${(selectedFiles.length > 0 || existingFiles.length > 0) ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} />
                      </div>
                      {(selectedFiles.length > 0 || existingFiles.length > 0) ? (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary">{selectedFiles.length + existingFiles.length} files attached</p>
                          <p className="text-xs text-slate-500">{[...existingFiles.map(f => f.originalName), ...selectedFiles.map(f => f.name)].join(", ")}</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or Images (Max 10MB each)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {!isPublishedExam && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-xl h-11"
                        data-testid="button-save-draft"
                        onClick={handleSaveDraft}
                        disabled={saveDraftMutation.isPending || mutation.isPending}
                      >
                        {saveDraftMutation.isPending ? <Spinner className="mr-2 size-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Draft
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl h-11 shadow-lg shadow-primary/20"
                      disabled={isGenerating}
                      data-testid="button-generate"
                    >
                      {isGenerating ? (
                        <>
                          <Spinner className="mr-2 size-4 text-white" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Questions
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Questions Section Removed (Moved to separate page) */}
          </form>
        </main>

        {/* Question Preview/Edit Drawer */}
        <Sheet open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            {selectedQuestion && (
              <>
                <SheetHeader className="pb-6 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{selectedQuestion.type || "Short"}</Badge>
                    <Badge variant="outline" className="text-slate-500">{selectedQuestion.difficulty}</Badge>
                    <Badge variant="outline" className="bg-slate-100">{selectedQuestion.marks} Marks</Badge>
                  </div>
                  <SheetTitle className="text-xl leading-tight">{selectedQuestion.id}: Edit Question</SheetTitle>
                  <SheetDescription>Update the question content or metadata below.</SheetDescription>
                </SheetHeader>

                <div className="py-8 space-y-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Text</Label>
                    <Textarea
                      defaultValue={selectedQuestion.text}
                      className="text-lg text-slate-900 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[120px]"
                      onChange={(e) => {
                        const text = e.target.value;
                        setGeneratedQuestions((prev: any[]) => prev.map(q => q.id === selectedQuestion.id ? { ...q, text } : q));
                        setSelectedQuestion((prev: any) => prev ? { ...prev, text } : null);
                      }}
                    />
                  </div>

                  {selectedQuestion.options && (
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Options</Label>
                      <div className="grid gap-3">
                        {selectedQuestion.options.map((opt: string, i: number) => (
                          <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${opt === selectedQuestion.answer ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-100 text-slate-600'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${opt === selectedQuestion.answer ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <Input
                              defaultValue={opt}
                              className="bg-transparent border-0 focus-visible:ring-0 p-0 h-auto font-medium"
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setGeneratedQuestions((prev: any[]) => prev.map(q => {
                                  if (q.id === selectedQuestion.id) {
                                    const newOpts = [...q.options];
                                    newOpts[i] = newVal;
                                    return { ...q, options: newOpts };
                                  }
                                  return q;
                                }));
                                setSelectedQuestion((prev: any) => {
                                  if (prev) {
                                    const newOpts = [...prev.options];
                                    newOpts[i] = newVal;
                                    return { ...prev, options: newOpts };
                                  }
                                  return null;
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Correct Answer</Label>
                    <Input
                      defaultValue={selectedQuestion.answer}
                      className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-sm h-auto"
                      onChange={(e) => {
                        const answer = e.target.value;
                        setGeneratedQuestions((prev: any[]) => prev.map(q => q.id === selectedQuestion.id ? { ...q, answer } : q));
                        setSelectedQuestion((prev: any) => prev ? { ...prev, answer } : null);
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">AI Explanation</h4>
                    <div className="flex gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <Sparkles className="h-5 w-5 text-blue-500 shrink-0" />
                      <Textarea
                        defaultValue={selectedQuestion.explanation}
                        className="text-sm text-slate-700 leading-relaxed italic bg-transparent border-0 focus-visible:ring-0 p-0 min-h-[80px]"
                        onChange={(e) => {
                          const explanation = e.target.value;
                          setGeneratedQuestions((prev: any[]) => prev.map(q => q.id === selectedQuestion.id ? { ...q, explanation } : q));
                          setSelectedQuestion((prev: any) => prev ? { ...prev, explanation } : null);
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button className="flex-1 rounded-xl" onClick={() => setSelectedQuestion(null)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}