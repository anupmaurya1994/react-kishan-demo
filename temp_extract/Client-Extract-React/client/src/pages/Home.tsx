import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-[#0b1121] flex items-center justify-center text-white">Loading...</div>;
  }

  if (user) {
    return <Redirect to="/patients" />;
  }

  return <Redirect to="/login" />;
}
