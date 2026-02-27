import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BrainCircuit, ChevronLeft, Search, Filter, Edit2, Trash2, RefreshCw, Eye, CheckCircle2, Copy, ExternalLink, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function QuestionsList() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState("Processing");
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatus("Completed"), 2000);
    return () => clearTimeout(timer);
  }, []);

  const mockQuestions = [
    { id: "Q-101", text: "What are the primary components of a cell membrane?", type: "Short", difficulty: "Medium", marks: 5, options: null, answer: "Phospholipid bilayer, proteins, cholesterol, and carbohydrates.", explanation: "The cell membrane is a fluid mosaic model consisting of various molecules that allow for selective permeability." },
    { id: "Q-102", text: "Which organelle is known as the powerhouse of the cell?", type: "MCQ", difficulty: "Easy", marks: 2, options: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"], answer: "Mitochondria", explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions." },
    { id: "Q-103", text: "Explain the process of photosynthesis in detail.", type: "Long", difficulty: "Hard", marks: 15, options: null, answer: "Complex biological process...", explanation: "Requires understanding of the Calvin cycle and electron transport chain." },
  ];

  const handlePublish = () => {
    setIsPublishModalOpen(true);
  };

  const confirmPublish = () => {
    setIsPublished(true);
    setIsPublishModalOpen(false);
    toast({
      title: "Exam Published Successfully",
      description: "Students can now attempt the exam using the link.",
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://app.exam.com/attempt/${id}`);
    toast({ title: "Link Copied!", description: "The attempt link has been copied to your clipboard." });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Midterm Biology 101</span>
                <Badge variant="outline" className={status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100 animate-pulse"}>
                  {status}
                </Badge>
              </div>
              <span className="text-xs text-slate-400">Subject: Biology</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setLocation("/exam-lists")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-full px-6"
            >
              View All
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 animate-in fade-in duration-700">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl font-bold">Generated Questions</CardTitle>
              <CardDescription>Review, edit, and finalize your exam questions.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search questions..." className="pl-9 w-[240px] h-9 rounded-full bg-slate-50 border-transparent focus:bg-white" />
              </div>
              <Button variant="outline" size="sm" className="rounded-full h-9 gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Question Preview</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQuestions.map((q) => (
                  <TableRow key={q.id} className="hover:bg-slate-50/50 group cursor-pointer" onClick={() => setSelectedQuestion(q)}>
                    <TableCell className="font-mono text-xs text-slate-500">{q.id}</TableCell>
                    <TableCell className="max-w-[400px] truncate font-medium text-slate-700">{q.text}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full font-normal">{q.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold ${
                        q.difficulty === 'Easy' ? 'text-emerald-600' : 
                        q.difficulty === 'Medium' ? 'text-blue-600' : 'text-rose-600'
                      }`}>{q.difficulty}</span>
                    </TableCell>
                    <TableCell className="font-bold">{q.marks}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-500" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-inter">Total 3 questions generated from materials.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg">Next</Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Question Details Sheet */}
      <Sheet open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedQuestion && (
            <div className="py-6 space-y-8">
              <SheetHeader className="pb-6 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/10 text-primary border-0">{selectedQuestion.type}</Badge>
                  <Badge variant="outline">{selectedQuestion.difficulty}</Badge>
                  <Badge variant="secondary">{selectedQuestion.marks} Marks</Badge>
                </div>
                <SheetTitle className="text-2xl">{selectedQuestion.id}: Question Details</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Question</Label>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-medium leading-relaxed">
                    {selectedQuestion.text}
                  </div>
                </div>

                {selectedQuestion.options && (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Options</Label>
                    <div className="grid gap-2">
                      {selectedQuestion.options.map((opt: string, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${opt === selectedQuestion.answer ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-100 text-slate-600'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${opt === selectedQuestion.answer ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-sm font-medium">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Correct Answer</Label>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-medium">
                    {selectedQuestion.answer}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Explanation</Label>
                  <div className="flex gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <Sparkles className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      {selectedQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex gap-3">
                <Button className="flex-1 rounded-xl gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Question
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Publish Success Dialog */}
      <Dialog open={isPublished} onOpenChange={setIsPublished}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="items-center text-center">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">Exam Published Successfully</DialogTitle>
            <DialogDescription className="text-slate-500">
              The exam is now live. Share the link below with your students to start the assessment.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Student Attempt Link</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm font-mono text-slate-600 truncate bg-white p-2 border rounded-lg">
                https://app.exam.com/attempt/{id}
              </div>
              <Button size="icon" variant="outline" className="rounded-lg shrink-0" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-center mt-6">
            <Button className="w-full rounded-xl gap-2 h-11" onClick={() => setLocation("/dashboard")}>
              Go to Dashboard
              <ExternalLink className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Exam?</DialogTitle>
            <DialogDescription>
              This will make the exam available to students. Please ensure all questions have been reviewed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsPublishModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmPublish} className="bg-primary shadow-lg shadow-primary/20">Confirm & Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}