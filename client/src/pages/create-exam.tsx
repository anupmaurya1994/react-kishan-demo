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
import { BrainCircuit, ChevronLeft, Upload, Sparkles, Save, Edit2, Trash2, RefreshCw, Eye, Search, Filter, FileText, AlertCircle, Plus, Send } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import AppHeader from "./AppHeader";

const examSchema = z.object({
  title: z.string().min(1, "Exam title is required"),
  subject: z.string().min(1, "Subject is required"),
  difficulty: z.string().min(1, "Difficulty level is required"),
  description: z.string().optional(),
  questionCount: z.coerce.number().min(1, "Minimum 1 question required").max(50, "Maximum 50 questions allowed"),
  topics: z.string().min(1, "Important topics are required"),
  timeLimit: z.coerce.number().min(1, "Minimum 1 minute allowed").max(480, "Maximum 480 minutes allowed"),
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
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      difficulty: "",
    },
  })

  useEffect(() => {
    const isEditing = sessionStorage.getItem("isEditingExam");

    if (isEditing === "true") {
      const savedData = sessionStorage.getItem("current_exam_data");

      if (savedData) {
        const parsed = JSON.parse(savedData);

        reset({
          title: parsed.title || "",
          subject: parsed.subject || "",
          topics: parsed.topics || "",
          timeLimit: parsed.timeLimit || 60,
          difficulty: parsed.difficulty || "medium",
          description: parsed.description || "",
          questionCount: parsed.questions?.length || 4,
        });
      }
      sessionStorage.removeItem("isEditingExam");
    }
  }, [reset]);

  const mutation = useMutation({
    mutationFn: async (values: ExamFormValues) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Return requested number of questions from mock data
      const result = [];
      for (let i = 0; i < values.questionCount; i++) {
        const mockQ = MOCK_QUESTIONS[i % MOCK_QUESTIONS.length];
        result.push({
          ...mockQ,
          id: (i + 1).toString(),
          difficulty: values.difficulty || mockQ.difficulty,
          subject: values.subject
        });
      }
      return result;
    },
    onSuccess: (data, values) => {
      const examData = {
        questions: data,
        timeLimit: values.timeLimit,
        topics: values.topics,
        title: values.title,
        subject: values.subject,
        difficulty: values.difficulty,      // ✅ ADD THIS
        description: values.description     // ✅ ADD THIS
      };
      sessionStorage.setItem("current_exam_data", JSON.stringify(examData));

      setGeneratedQuestions(data);
      setStatus("Completed");
      toast.success("Questions generated successfully!");

      // Navigate to the questions list page
      setTimeout(() => {
        setLocation("/exams/demo-id/questions");
      }, 500);
    },
    onError: (error: any) => {
      toast.error(error.message);
      setStatus("Draft");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      setPublishStatus("Published");
      toast.success("Exam published successfully!");
    },
  });

  const handleGenerate = (values: ExamFormValues) => {
    setStatus("Processing");
    mutation.mutate(values);
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
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const isGenerating = mutation.isPending;

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-slate-50/50 flex flex-col">

        {/* <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">ExamAI</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">{status}</Badge>
              <Badge variant="outline" className={`${publishStatus === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{publishStatus}</Badge>
            </div>
          </div>
        </header> */}

        <main className="flex-1 container mx-auto px-4 py-8">
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
                        name="difficulty"
                        control={control}
                        defaultValue=""   // ✅ ADD THIS LINE
                        render={({ field }) => (
                          <Select
                            value={field.value || ""}  // ✅ important
                            onValueChange={(value) => field.onChange(value)}  // ✅ important
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={errors.questionCount ? "text-destructive" : ""}>Number of Questions</Label>
                      <Input
                        type="number"
                        {...register("questionCount")}
                        placeholder="20"
                        className={`rounded-xl ${errors.questionCount ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.questionCount && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.questionCount.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className={errors.timeLimit ? "text-destructive" : ""}>Time Limit (Minutes)</Label>
                      <Input
                        type="number"
                        {...register("timeLimit")}
                        placeholder="60"
                        className={`rounded-xl ${errors.timeLimit ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.timeLimit && <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.timeLimit.message}</p>}
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
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${selectedFiles.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-primary/5'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 ${selectedFiles.length > 0 ? 'bg-primary/20' : 'bg-slate-100'}`}>
                        <Upload className={`h-6 w-6 ${selectedFiles.length > 0 ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} />
                      </div>
                      {selectedFiles.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary">{selectedFiles.length} files selected</p>
                          <p className="text-xs text-slate-500">{selectedFiles.map(f => f.name).join(", ")}</p>
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
                    <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" data-testid="button-save-draft">
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl h-11 shadow-lg shadow-primary/20"
                      disabled={isGenerating}
                      data-testid="button-generate"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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