import { useState } from "react";
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
import { BrainCircuit, ChevronLeft, Upload, Sparkles, Save, Edit2, Trash2, RefreshCw, Eye, Search, Filter, FileText } from "lucide-react";

export default function CreateExam() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("Draft");
  const [publishStatus, setPublishStatus] = useState("Pending");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const mockQuestions = [
    { id: "Q-101", text: "What are the primary components of a cell membrane?", type: "Short", difficulty: "Medium", marks: 5, options: null, answer: "Phospholipid bilayer, proteins, cholesterol, and carbohydrates.", explanation: "The cell membrane is a fluid mosaic model consisting of various molecules that allow for selective permeability." },
    { id: "Q-102", text: "Which organelle is known as the powerhouse of the cell?", type: "MCQ", difficulty: "Easy", marks: 2, options: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"], answer: "Mitochondria", explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions." },
    { id: "Q-103", text: "Explain the process of photosynthesis in detail, including the light-dependent and light-independent reactions.", type: "Long", difficulty: "Hard", marks: 15, options: null, answer: "Complex biological process...", explanation: "Requires understanding of the Calvin cycle and electron transport chain." },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setStatus("Processing");
    setTimeout(() => {
      setIsGenerating(false);
      setStatus("Completed");
      // Generate a dummy ID for the exam
      const examId = "exam-" + Math.random().toString(36).substr(2, 9);
      setLocation(`/exams/${examId}/questions`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
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
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">{publishStatus}</Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className={`${showQuestions ? 'lg:col-span-4' : 'lg:col-span-8 lg:col-start-3'} space-y-6 transition-all duration-500`}>
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="text-xl font-bold">Exam Details</CardTitle>
                <CardDescription>Configure your exam parameters and upload source materials.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label>Exam Title</Label>
                  <Input placeholder="e.g. Midterm Biology 101" className="rounded-xl" data-testid="input-exam-title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="e.g. Biology" className="rounded-xl" data-testid="input-subject" />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Instructions for students..." className="rounded-xl min-h-[100px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Exam Strength (Students)</Label>
                    <Input type="number" placeholder="50" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Questions</Label>
                    <Input type="number" placeholder="20" className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Important Topics (Tags)</Label>
                  <Input placeholder="Cell Biology, Genetics, Evolution..." className="rounded-xl" />
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label>Upload Study Materials</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-slate-500 group-hover:text-primary" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or Images (Max 10MB each)</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 rounded-xl h-11" data-testid="button-save-draft">
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl h-11 shadow-lg shadow-primary/20" 
                    onClick={handleGenerate}
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

          {/* Questions Table Section */}
          {showQuestions && (
            <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <Card className="border-0 shadow-sm h-full flex flex-col">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-xl font-bold">Generated Questions</CardTitle>
                    <CardDescription>Review and refine the AI-generated content.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search..." className="pl-9 w-[200px] h-9 rounded-full bg-slate-50 border-transparent focus:bg-white" />
                    </div>
                    <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Diff.</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockQuestions.map((q) => (
                        <TableRow key={q.id} className="cursor-pointer hover:bg-slate-50/50 group" onClick={() => setSelectedQuestion(q)}>
                          <TableCell className="font-mono text-xs text-slate-500">{q.id}</TableCell>
                          <TableCell className="max-w-[300px] truncate font-medium text-slate-700">{q.text}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full bg-white text-xs font-normal">{q.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium ${
                              q.difficulty === 'Easy' ? 'text-emerald-600' : 
                              q.difficulty === 'Medium' ? 'text-blue-600' : 'text-rose-600'
                            }`}>{q.difficulty}</span>
                          </TableCell>
                          <TableCell className="font-semibold">{q.marks}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-500">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                  <p className="text-xs text-slate-500">Showing 3 of 20 generated questions</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled>Prev</Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg">Next</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Question Preview Drawer */}
      <Sheet open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedQuestion && (
            <>
              <SheetHeader className="pb-6 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{selectedQuestion.type}</Badge>
                  <Badge variant="outline" className="text-slate-500">{selectedQuestion.difficulty}</Badge>
                  <Badge variant="outline" className="bg-slate-100">{selectedQuestion.marks} Marks</Badge>
                </div>
                <SheetTitle className="text-xl leading-tight">{selectedQuestion.id}: Question Preview</SheetTitle>
                <SheetDescription>View detailed information and AI-generated metadata.</SheetDescription>
              </SheetHeader>
              
              <div className="py-8 space-y-8">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Question Text</h4>
                  <p className="text-lg text-slate-900 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedQuestion.text}
                  </p>
                </div>

                {selectedQuestion.options && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Options</h4>
                    <div className="grid gap-3">
                      {selectedQuestion.options.map((opt: string, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${opt === selectedQuestion.answer ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-100 text-slate-600'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${opt === selectedQuestion.answer ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedQuestion.options && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Correct Answer</h4>
                    <p className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-sm">
                      {selectedQuestion.answer}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">AI Explanation</h4>
                  <div className="flex gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <Sparkles className="h-5 w-5 text-blue-500 shrink-0" />
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      {selectedQuestion.explanation}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button className="flex-1 rounded-xl">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Question
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
  );
}