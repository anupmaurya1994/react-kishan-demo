import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { QuestionsList } from "@/components/QuestionsList";
import { useMutation } from "@tanstack/react-query";
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
import AppHeader from "./AppHeader";

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
  const [, setLocation] = useLocation();
  const [examData, setExamData] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [publishStatus, setPublishStatus] = useState("Draft");

  useEffect(() => {
    const savedData = sessionStorage.getItem("current_exam_data");
    if (savedData) {
      setExamData(JSON.parse(savedData));
    } else {
      toast.error("No exam data found. Redirecting...");
      setLocation("/create-exam");
    }
  }, [setLocation]);

  const publishMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      setPublishStatus("Published");
      toast.success("Exam published successfully!");
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const count = examData.questions.length || 4;
      const newQuestions = [];

      for (let i = 0; i < count; i++) {
        // Randomize selection from pool
        const randomIndex = Math.floor(Math.random() * MOCK_QUESTIONS_POOL.length);
        const mockQ = MOCK_QUESTIONS_POOL[randomIndex];
        newQuestions.push({
          ...mockQ,
          id: (i + 1).toString(),
          text: mockQ.text,
          subject: examData.subject,
          difficulty: examData.difficulty || mockQ.difficulty
        });
      }

      return newQuestions;
    },
    onSuccess: (newQuestions) => {
      const updatedData = { ...examData, questions: newQuestions };
      setExamData(updatedData);
      sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
      toast.success("Questions regenerated!");
    }
  });

  const handleDelete = (questionId: string) => {
    const updatedQuestions = examData.questions.filter(
      (q: any) => q.id !== questionId
    );
    const updatedData = { ...examData, questions: updatedQuestions };
    setExamData(updatedData);
    sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
    toast.success("Question deleted");
  };

  const handleAddManual = () => {
    const newId = (examData.questions.length + 1).toString();

    const newQuestion = {
      id: newId,
      text: "",
      marks: 1,
      options: ["", "", "", ""],
      correctAnswer: 0,
      answer: "",
      type: "MCQ",
      difficulty: "medium",
    };

    // Only open modal
    setSelectedQuestion(newQuestion);
  };

  const handleSaveNewQuestion = (newQ: any) => {
    const updatedQuestions = [...examData.questions, newQ];
    const updatedData = { ...examData, questions: updatedQuestions };

    setExamData(updatedData);
    sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));

    setSelectedQuestion(null);
    toast.success("Question added successfully");
  };

  const handleUpdateQuestion = (updatedQ: any) => {
    const updatedQuestions = examData.questions.map((q: any) =>
      q.id === updatedQ.id ? updatedQ : q
    );
    const updatedData = { ...examData, questions: updatedQuestions };
    setExamData(updatedData);
    sessionStorage.setItem("current_exam_data", JSON.stringify(updatedData));
    setSelectedQuestion(null);
    toast.success("Question updated");
  };

  if (!examData) return null;

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-slate-100 flex flex-col">

        {/* EXAM INFO CARD */}
        <div className="container mx-auto px-6 py-6">

          <Card className="p-8 rounded-2xl shadow-sm bg-white mb-6 border border-slate-200">
            <div className="flex justify-between items-start">

              {/* LEFT CONTENT */}
              <div className="space-y-4">

                {/* Exam Title */}
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                  {examData.title}
                </h1>

                {/* Subject + Time */}
                <div className="flex items-center gap-10 text-sm text-slate-600">

                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      Subject
                    </span>
                    <span className="font-medium text-slate-800">
                      {examData.subject}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      Time Limit
                    </span>
                    <span className="font-medium text-slate-800">
                      {examData.timeLimit} minutes
                    </span>
                  </div>

                </div>

                {/* Topics */}
                <div className="text-sm text-slate-500">
                  <span className="text-xs uppercase tracking-wide text-slate-400 block">
                    Topics
                  </span>
                  {examData.topics}
                </div>

              </div>

              {/* RIGHT BUTTON */}
              <Button
                variant="outline"
                className="h-10 px-6 rounded-xl"
                // onClick={() => setLocation("/create-exam")}
                onClick={() => {
                  sessionStorage.setItem("isEditingExam", "true");
                  setLocation("/create-exam");
                }}
              >
                Edit Exam Info
              </Button>

            </div>
          </Card>

          {/* QUESTIONS LIST */}
          <QuestionsList
            questions={examData.questions}
            onEdit={setSelectedQuestion}
            onDelete={handleDelete}
            onAddManual={handleAddManual}
            onRegenerate={() => regenerateMutation.mutate()}
            isRegenerating={regenerateMutation.isPending}
            onPublish={() => publishMutation.mutate()}
            isPublishing={publishMutation.isPending}
            publishStatus={publishStatus}
            timeLimit={examData.timeLimit}
            topics={examData.topics}
          />
        </div>

        {/* EDIT QUESTION DRAWER */}
        <Sheet
          open={!!selectedQuestion}
          onOpenChange={() => setSelectedQuestion(null)}
        >
          <SheetContent className="w-[500px] overflow-y-auto">
            {selectedQuestion && (
              <div className="py-6 space-y-6">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">
                    Edit Question {selectedQuestion.id}
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-4">

                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={selectedQuestion.text}
                      onChange={(e) =>
                        setSelectedQuestion({
                          ...selectedQuestion,
                          text: e.target.value,
                        })
                      }
                      className="min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label>Options</Label>
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
                        />
                        <Button
                          variant={
                            i === selectedQuestion.correctAnswer
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            setSelectedQuestion({
                              ...selectedQuestion,
                              correctAnswer: i,
                              answer: opt,
                            })
                          }
                        >
                          Correct
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
                        <SelectTrigger>
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
                      const exists = examData.questions.some(
                        (q: any) => q.id === selectedQuestion.id
                      );

                      if (exists) {
                        handleUpdateQuestion(selectedQuestion);
                      } else {
                        handleSaveNewQuestion(selectedQuestion);
                      }
                    }}
                  >
                    {examData.questions.some((q: any) => q.id === selectedQuestion.id)
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