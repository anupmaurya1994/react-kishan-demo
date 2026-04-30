import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import ExamsPage from "@/pages/exams";
import CreateExam from "@/pages/create-exam";
import QuestionsList from "@/pages/questions-list";
import ExamLists from "@/pages/exam-lists";
import ChallengeView from "@/pages/challenge-view";
import Setting from "./pages/Setting";
import LeaderboardPage from "./pages/leaderboard";
import ProfilePage from "./pages/profile";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import MainLayout from "./components/MainLayout";

function ProtectedRoute({ path, component: Component }: { path: string; component: any }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (user.role === 'teacher' && !user.isProfileComplete) {
        setLocation("/login");
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-10 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Route path={path}>
      <MainLayout>
        <Component />
      </MainLayout>
    </Route>
  );
}

function Router() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if logged in and trying to access login page
  useEffect(() => {
    if (user && (window.location.pathname === "/" || window.location.pathname === "/login")) {
      if (user.role === 'teacher' && !user.isProfileComplete) {
        // Stay on auth page so they can complete onboarding
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);

  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={AuthPage} />
      <Route path="/login" component={AuthPage} />

      {/* Protected */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/exams" component={ExamsPage} />
      <ProtectedRoute path="/create-exam" component={CreateExam} />
      <ProtectedRoute path="/exams/:id/questions" component={QuestionsList} />
      <ProtectedRoute path="/api/exams/challenge/:id" component={ChallengeView} />
      <ProtectedRoute path="/exam-lists" component={ExamLists} />
      <ProtectedRoute path="/settings" component={Setting} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <SonnerToaster position="top-right" richColors expand />
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;