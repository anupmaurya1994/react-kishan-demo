import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "next-themes";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import NotFound from "@/pages/not-found";
import Setting from "../../../../client/src/pages/Setting";
import AppHeader from "../../../../client/src/pages/AppHeader";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Login} />

      {/* Protected Routes - Removed ProtectedRoute wrapper for mockup */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/patients" component={Dashboard} />
      <Route path="/claims" component={Dashboard} />
      <Route path="/users" component={Dashboard} />
      <Route path="/settings" component={Setting} />
      <Route path="/app-header" component={AppHeader} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
