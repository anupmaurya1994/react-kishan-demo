import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CreateExam from "@/pages/create-exam";
import QuestionsList from "@/pages/questions-list";
import ExamLists from "@/pages/exam-lists";
import ChallengeView from "@/pages/challenge-view";
import Setting from "./pages/Setting";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { useEffect } from "react";

function ProtectedRoute({ path, component: Component }: { path: string; component: any }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return <Route path={path} component={Component} />;
}

function Router() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if logged in and trying to access login page
  useEffect(() => {
    if (user && (window.location.pathname === "/" || window.location.pathname === "/login")) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={AuthPage} />
      <Route path="/login" component={AuthPage} />

      {/* Protected */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/create-exam" component={CreateExam} />
      <ProtectedRoute path="/exams/:id/questions" component={QuestionsList} />
      <ProtectedRoute path="/api/exams/challenge/:id" component={ChallengeView} />
      <ProtectedRoute path="/exam-lists" component={ExamLists} />
      <ProtectedRoute path="/settings" component={Setting} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;