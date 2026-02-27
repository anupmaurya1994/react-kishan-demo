// import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Command, Github } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  // const { loginMutation, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      email: "teacher@example.com",
      password: "securepassword123"
    }
  });

  // useEffect(() => {
  //   // Ensure the values are set on mount if not picked up by defaultValues
  //   setValue("email", "admin@yopmail.com");
  //   setValue("password", "anup1994##");
  // }, [setValue]);

  // useEffect(() => {
  //   if (user) {
  //     setLocation("/dashboard");
  //   }
  // }, [user, setLocation]);

  // const onSubmit = (data: InsertUser) => {
  //   // Direct redirect to dashboard as requested
  //   setLocation("/dashboard");
  //   // loginMutation.mutate(data);
  // };

  const onSubmit = async (data: InsertUser) => {
    console.log("FORM DATA 👉", data);
    try {
      const response = await fetch("http://192.168.1.13:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("token", result.token);
      // setLocation("/dashboard");

    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1121] p-4 font-sans">
      <div className="mb-8 flex items-center gap-2 text-white">
        <Command className="w-6 h-6" />
        <span className="text-xl font-semibold tracking-tight">Shadcn Admin</span>
      </div>

      <Card className="w-full max-w-[400px] bg-[#0b1121] border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 pt-8 px-8">
          <CardTitle className="text-2xl font-semibold text-white">Sign in</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email and password below to log into your account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pt-4 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">Email</Label>
              <input
                {...register("email")}
                className="bg-[#151b2b] border-white/10 h-10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
                placeholder="admin@yopmail.com"
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">Password</Label>
                <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="bg-[#151b2b] border-white/10 h-10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/20 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              // disabled={loginMutation.isPending}
              className="w-full h-10 bg-white hover:bg-white/90 text-black font-medium transition-all flex items-center justify-center gap-2"
            >
              Sign in
              {/* <span className="text-lg">➔</span> {loginMutation.isPending ? "Signing in..." : "Sign in"} */}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-8 pb-8 pt-2">
          <p className="text-xs text-center w-full text-muted-foreground leading-relaxed">
            By clicking sign in, you agree to our{" "}
            <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
