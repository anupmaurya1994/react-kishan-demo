import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  CheckCircle,
  Link as LinkIcon,
  Copy,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_EXAM = {
  id: "EXAM-12345",
  name: "Advanced Human Anatomy",
  subject: "Medical Science",
  status: "Completed", // Processing -> Completed
  publish_status: "Draft", // Draft -> Published
  questions_count: 5
};

const MOCK_QUESTIONS = [
  {
    id: "Q-001",
    text: "What is the primary function of the cerebellum in the human brain?",
    type: "MCQ",
    difficulty: "Medium",
    marks: 5,
    options: ["Memory storage", "Motor control and balance", "Visual processing", "Emotional regulation"],
    correctAnswer: "Motor control and balance",
    explanation: "The cerebellum is primarily responsible for coordinating voluntary movements and maintaining posture and balance."
  },
  {
    id: "Q-002",
    text: "Explain the process of pulmonary gas exchange in the alveoli.",
    type: "Long",
    difficulty: "Hard",
    marks: 10,
    options: [],
    correctAnswer: "Gas exchange occurs via diffusion through the alveolar-capillary membrane.",
    explanation: "Oxygen moves from the alveoli into the blood, while carbon dioxide moves from the blood into the alveoli."
  },
  {
    id: "Q-003",
    text: "How many bones are in the adult human body?",
    type: "Short",
    difficulty: "Easy",
    marks: 2,
    options: [],
    correctAnswer: "206",
    explanation: "While infants are born with around 270 bones, many fuse together as the body grows, resulting in 206 bones in adulthood."
  },
  {
    id: "Q-004",
    text: "Which valve separates the left atrium from the left ventricle?",
    type: "MCQ",
    difficulty: "Medium",
    marks: 5,
    options: ["Tricuspid valve", "Pulmonary valve", "Mitral (bicuspid) valve", "Aortic valve"],
    correctAnswer: "Mitral (bicuspid) valve",
    explanation: "The mitral valve controls the flow of oxygen-rich blood from the left atrium to the left ventricle."
  },
  {
    id: "Q-005",
    text: "What is the functional unit of the kidney?",
    type: "Short",
    difficulty: "Easy",
    marks: 2,
    options: [],
    correctAnswer: "Nephron",
    explanation: "The nephron is responsible for filtering blood and forming urine."
  }
];

export default function ExamLists() {
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [exam, setExam] = useState(MOCK_EXAM);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  
  // Modal States
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || q.type === typeFilter;
      const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }, [questions, searchQuery, typeFilter, difficultyFilter]);

  const handleView = (q: any) => {
    setSelectedQuestion(q);
    setIsViewOpen(true);
  };

  const handleEdit = (q: any) => {
    setSelectedQuestion({ ...q });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success("Question deleted successfully");
  };

  const handleRegenerate = (id: string) => {
    toast.info("Regenerating question " + id);
    // Logic for regeneration would go here
  };

  const handleSaveEdit = () => {
    setQuestions(questions.map(q => q.id === selectedQuestion.id ? selectedQuestion : q));
    setIsEditOpen(false);
    toast.success("Question updated successfully");
  };

  const handlePublish = () => {
    if (questions.length < 3) {
      toast.error("Minimum 3 questions required to publish");
      return;
    }
    if (exam.status !== "Completed") {
      toast.error("Exam generation must be completed before publishing");
      return;
    }
    
    setExam({ ...exam, publish_status: "Published" });
    setIsPublishModalOpen(true);
  };

  const copyLink = () => {
    const link = `https://app.exam.com/attempt/${exam.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Attempt link copied to clipboard!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{exam.name}</h1>
              <p className="text-muted-foreground">{exam.subject}</p>
            </div>
            <Badge variant={exam.status === "Completed" ? "default" : "secondary"} className="ml-2">
              {exam.status}
            </Badge>
            {exam.publish_status === "Published" && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white ml-2">
                Published
              </Badge>
            )}
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={handlePublish}
            disabled={exam.publish_status === "Published"}
          >
            <CheckCircle className="h-4 w-4" />
            Publish Exam
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search questions by text or ID..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-questions"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MCQ">MCQ</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 p-8">
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[120px] font-semibold">Question ID</TableHead>
                <TableHead className="font-semibold">Question Text</TableHead>
                <TableHead className="w-[100px] font-semibold">Type</TableHead>
                <TableHead className="w-[120px] font-semibold">Difficulty</TableHead>
                <TableHead className="w-[80px] font-semibold">Marks</TableHead>
                <TableHead className="w-[160px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <TableRow key={q.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs font-medium text-blue-600">{q.id}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate text-sm font-medium">{q.text}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-[10px] uppercase tracking-wider">
                        {q.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-[10px] uppercase tracking-wider",
                          q.difficulty === "Easy" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                          q.difficulty === "Medium" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                          q.difficulty === "Hard" && "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        )}
                      >
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{q.marks}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600" onClick={() => handleView(q)} data-testid={`button-view-${q.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-600" onClick={() => handleEdit(q)} data-testid={`button-edit-${q.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-600" onClick={() => handleDelete(q.id)} data-testid={`button-delete-${q.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600" onClick={() => handleRegenerate(q.id)} data-testid={`button-regenerate-${q.id}`}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No questions found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Mockup */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{filteredQuestions.length}</span> of <span className="font-medium">{questions.length}</span> questions
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Question View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl sm:rounded-2xl">
          {selectedQuestion && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">Question Detail - {selectedQuestion.id}</DialogTitle>
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "text-[10px] uppercase tracking-wider",
                      selectedQuestion.difficulty === "Easy" && "bg-emerald-500/10 text-emerald-600",
                      selectedQuestion.difficulty === "Medium" && "bg-amber-500/10 text-amber-600",
                      selectedQuestion.difficulty === "Hard" && "bg-rose-500/10 text-rose-600"
                    )}
                  >
                    {selectedQuestion.difficulty}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Question Text</Label>
                  <p className="text-base font-medium leading-relaxed">{selectedQuestion.text}</p>
                </div>
                
                {selectedQuestion.type === "MCQ" && selectedQuestion.options.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-muted-foreground">Options</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedQuestion.options.map((option: string, i: number) => (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-center p-3 rounded-lg border text-sm transition-colors",
                            option === selectedQuestion.correctAnswer 
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700" 
                              : "bg-muted/30 border-transparent"
                          )}
                        >
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold mr-3 shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {option}
                          {option === selectedQuestion.correctAnswer && (
                            <CheckCircle className="ml-auto h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Correct Answer</Label>
                    <div className="p-3 bg-muted/50 rounded-lg text-sm font-medium">
                      {selectedQuestion.correctAnswer}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Marks</Label>
                    <div className="p-3 bg-muted/50 rounded-lg text-sm font-medium">
                      {selectedQuestion.marks} Points
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Explanation</Label>
                  <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-xl border border-dashed italic">
                    {selectedQuestion.explanation}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setIsViewOpen(false); handleEdit(selectedQuestion); }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Question
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Question Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
          {selectedQuestion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Edit Question - {selectedQuestion.id}</DialogTitle>
                <DialogDescription>Modify the question content and metadata.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea 
                    value={selectedQuestion.text} 
                    onChange={(e) => setSelectedQuestion({ ...selectedQuestion, text: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select 
                      value={selectedQuestion.difficulty} 
                      onValueChange={(val) => setSelectedQuestion({ ...selectedQuestion, difficulty: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input 
                      type="number" 
                      value={selectedQuestion.marks} 
                      onChange={(e) => setSelectedQuestion({ ...selectedQuestion, marks: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Input 
                    value={selectedQuestion.correctAnswer} 
                    onChange={(e) => setSelectedQuestion({ ...selectedQuestion, correctAnswer: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Explanation</Label>
                  <Textarea 
                    value={selectedQuestion.explanation} 
                    onChange={(e) => setSelectedQuestion({ ...selectedQuestion, explanation: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Publish Success Modal */}
      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="max-w-md sm:rounded-3xl p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold">Exam Published Successfully</DialogTitle>
              <DialogDescription className="text-base">
                Your exam is now live. Share the attempt link with your students to start the assessment.
              </DialogDescription>
            </div>
            
            <div className="w-full space-y-3 pt-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-xl border border-dashed border-muted-foreground/30 font-mono text-sm text-muted-foreground break-all">
                <LinkIcon className="h-4 w-4 shrink-0" />
                https://app.exam.com/attempt/{exam.id}
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 py-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                onClick={copyLink}
              >
                <Copy className="h-4 w-4" />
                Copy Attempt Link
              </Button>
            </div>
            
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => setIsPublishModalOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}