import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Sparkles, BookOpenCheck, Eye, EyeOff, MapPin, Building2, BookOpen, Briefcase, ShieldCheck, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import authBg from "../assets/images/auth-bg.png";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { indianStates, getCitiesForState, getCollegesForCity } from "../data/india-education-data";

export default function AuthPage() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<"student-login" | "student-signup" | "teacher-login" | "teacher-signup" | "teacher-onboarding" | "admin-login" | "forgot-password">("student-login");

  // Forgot Password State
  const [fpStep, setFpStep] = useState<"email" | "otp" | "reset">("email");
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");
  const [showFpPassword, setShowFpPassword] = useState(false);
  const [showFpConfirm, setShowFpConfirm] = useState(false);

  const [showPassword, setShowPassword] = useState({
    teacherLogin: false,
    teacherSignup: false,
    studentLogin: false,
    studentSignup: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    if (user && user.role === 'teacher' && !user.isProfileComplete) {
      setActiveView("teacher-onboarding");
    }
  }, [user]);
  const [isLoading, setIsLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loginFields, setLoginFields] = useState({ email: "", password: "" });

  const [signupValues, setSignupValues] = useState({
    firstName: "",
    lastName: "",
    institution: "",
    email: "",
    password: "",
  });

  const [signupErrors, setSignupErrors] = useState<{
    firstName?: string;
    lastName?: string;
    institution?: string;
    email?: string;
    password?: string;
  }>({});

  // Student Auth State
  const [studentStep, setStudentStep] = useState<"email" | "otp">("email");
  const [studentFields, setStudentFields] = useState({
    email: "",
    otp: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [studentErrors, setStudentErrors] = useState<{
    email?: string;
    otp?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  }>({});

  // Teacher Auth OTP State
  const [teacherStep, setTeacherStep] = useState<"email" | "otp">("email");
  const [teacherFields, setTeacherFields] = useState({
    email: "",
    otp: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [teacherErrors, setTeacherErrors] = useState<{
    email?: string;
    otp?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  }>({});

  const [onboardingFields, setOnboardingFields] = useState({
    state: "",
    city: "",
    college: "",
    subject: "",
    profession: "",
    additionalInfo: "",
  });
  const [onboardingErrors, setOnboardingErrors] = useState<{
    state?: string;
    city?: string;
    college?: string;
    subject?: string;
    profession?: string;
  }>({});

  const availableCities = useMemo(() => getCitiesForState(onboardingFields.state), [onboardingFields.state]);
  const availableColleges = useMemo(() => getCollegesForCity(onboardingFields.state, onboardingFields.city), [onboardingFields.state, onboardingFields.city]);

  interface LoginResponse {
    token: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    message?: string;
  }

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Invalid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 3) return "Password must be at least 3 characters";
    return "";
  };

  // const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   const formData = new FormData(e.currentTarget);
  //   const email = formData.get("email")?.toString() || "";
  //   const password = formData.get("password")?.toString() || "";

  //   // Validate fields
  //   const errors = {
  //     email: validateEmail(email),
  //     password: validatePassword(password),
  //   };
  //   setLoginErrors(errors);

  //   // Stop if there are validation errors
  //   if (errors.email || errors.password) return;

  //   setIsLoading(true);

  //   try {
  //     const response = await fetch("http://192.168.1.13:5000/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });
  //     const data = await response.json();

  //     if (!response.ok) {
  //       // Show API error inline under password field
  //       setLoginErrors({ ...errors, password: data.message || "Login failed" });
  //       return;
  //     }

  //     localStorage.setItem("token", data.token);

  //      const fullName = data.user ? `${data.user.firstName} ${data.user.lastName}` : "User Name";
  //   setUser({ name: fullName, email: data.user?.email || email });

  //     toast({ title: "Login successful 🎉", description: "Welcome back!" });
  //     setLocation("/dashboard");
  //   } catch (err: any) {
  //     setLoginErrors({ ...errors, password: err.message });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   const formData = new FormData(e.currentTarget);
  //   const firstName = formData.get("firstName")?.toString() || "";
  //   const lastName = formData.get("lastName")?.toString() || "";
  //   const institution = formData.get("institution")?.toString() || "";
  //   const email = formData.get("email")?.toString() || "";
  //   const password = formData.get("password")?.toString() || "";

  //   const errors = {
  //     firstName: firstName.trim() ? "" : "First name is required",
  //     lastName: lastName.trim() ? "" : "Last name is required",
  //     institution: institution.trim() ? "" : "Institution is required",
  //     email: (() => {
  //       if (!email) return "Email is required";
  //       const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //       return regex.test(email) ? "" : "Invalid email address";
  //     })(),
  //     password: (() => {
  //       if (!password) return "Password is required";
  //       return password.length >= 3 ? "" : "Password must be at least 3 characters";
  //     })(),
  //   };

  //   setSignupErrors(errors);

  //   if (Object.values(errors).some(Boolean)) return;

  //   setIsLoading(true);
  //   try {
  //     const res = await fetch("http://192.168.1.13:5000/api/auth/register", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ firstName, lastName, institution, email, password }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       setSignupErrors({ ...errors, password: data.message || "Signup failed" });
  //       return;
  //     }

  //     toast({
  //       title: "Account created successfully 🎉",
  //       description: "You can now log in with your new account.",
  //     });
  //     setLocation("/");
  //   } catch (err: any) {
  //     setSignupErrors({ ...errors, password: err.message });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



  // const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   const { firstName, lastName, institution, email, password } = signupValues;

  //   const errors = {
  //     firstName: firstName.trim() ? "" : "First name is required",
  //     lastName: lastName.trim() ? "" : "Last name is required",
  //     institution: institution.trim() ? "" : "Institution is required",
  //     email: (() => {
  //       if (!email) return "Email is required";
  //       const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //       return regex.test(email) ? "" : "Invalid email address";
  //     })(),
  //     password: (() => {
  //       if (!password) return "Password is required";
  //       return password.length >= 3 ? "" : "Password must be at least 3 characters";
  //     })(),
  //   };

  //   setSignupErrors(errors);
  //   if (Object.values(errors).some(Boolean)) return;

  //   setIsLoading(true);
  //   try {
  //     const res = await fetch("http://192.168.1.13:5000/api/auth/register", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ firstName, lastName, institution, email, password }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) {
  //       setSignupErrors({ ...errors, password: data.message || "Signup failed" });
  //       return;
  //     }

  //     toast({
  //       title: "Account created successfully 🎉",
  //       description: "You can now log in with your new account.",
  //     });

  //     const fullName = `${firstName} ${lastName}`;
  //     const newUser = { name: fullName, email };
  //     localStorage.setItem("user", JSON.stringify(newUser));


  //     setLocation("/");
  //   } catch (err: any) {
  //     setSignupErrors({ ...errors, password: err.message });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleForgotSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailErr = validateEmail(fpEmail);
    if (emailErr) { setFpError(emailErr); return; }
    setFpError("");
    setFpLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.message || "Failed to send OTP"); return; }
      toast({ title: "OTP Sent! 📧", description: "Check your email for the 6-digit OTP." });
      setFpStep("otp");
    } catch (err: any) {
      setFpError(err.message);
    } finally {
      setFpLoading(false);
    }
  };

  const handleForgotVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fpOtp.length !== 6) { setFpError("Enter the 6-digit OTP"); return; }
    setFpError("");
    setFpStep("reset");
  };

  const handleForgotResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fpNewPassword.length < 6) { setFpError("Password must be at least 6 characters"); return; }
    if (fpNewPassword !== fpConfirmPassword) { setFpError("Passwords do not match"); return; }
    setFpError("");
    setFpLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp, newPassword: fpNewPassword, confirmPassword: fpConfirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.message || "Reset failed"); return; }
      toast({ title: "Password Reset! 🎉", description: "You can now log in with your new password." });
      // reset state and go back to login
      setFpStep("email"); setFpEmail(""); setFpOtp(""); setFpNewPassword(""); setFpConfirmPassword("");
      setActiveView("teacher-login");
    } catch (err: any) {
      setFpError(err.message);
    } finally {
      setFpLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>, role: "teacher" | "student" | "admin") => {
    e.preventDefault();

    const { email, password } = loginFields;

    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setLoginErrors(errors);
    if (errors.email || errors.password) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        setLoginErrors({ ...errors, password: data.message || "Login failed" });
        return;
      }

      const fullName = data.firstName ? `${data.firstName} ${data.lastName}` : (email
        .split("@")[0]
        .replace(/\./g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()));

      const newUser = {
        _id: data.id,
        name: fullName,
        email,
        role: data.role || "teacher",
        isProfileComplete: data.isProfileComplete,
      };

      login(newUser, data.token);

      toast({
        title: "Login successful 🎉",
        description: `Welcome back, ${fullName}!`,
      });

      if (role === 'teacher' && !data.isProfileComplete) {
        setActiveView("teacher-onboarding");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setLoginErrors({ ...errors, password: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { firstName, lastName, institution, email, password } = signupValues;

    const errors = {
      firstName: firstName.trim() ? "" : "First name is required",
      lastName: lastName.trim() ? "" : "Last name is required",
      institution: institution.trim() ? "" : "Institution is required",
      email: (() => {
        if (!email) return "Email is required";
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) ? "" : "Invalid email address";
      })(),
      password: (() => {
        if (!password) return "Password is required";
        return password.length >= 3 ? "" : "Password must be at least 3 characters";
      })(),
    };

    setSignupErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          institution,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSignupErrors({ ...errors, password: data.message || "Signup failed" });
        return;
      }

      const fullName = `${firstName} ${lastName}`;

      const newUser = {
        name: fullName,
        email,
        role: "teacher",
      };

      // Note: Signup returns a token, let's use it to log them in automatically
      login(newUser, data.token);

      toast({
        title: "Account created successfully 🎉",
        description: "Welcome to ExamAI!",
      });

      setLocation("/dashboard");
    } catch (err: any) {
      setSignupErrors({ ...errors, password: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validateEmail(studentFields.email);
    if (error) {
      setStudentErrors({ ...studentErrors, email: error });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/student/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentFields.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStudentErrors({ ...studentErrors, email: data.message || "Failed to send OTP" });
        return;
      }

      toast({ title: "OTP Sent! 📧", description: "Please check your email for the verification code." });
      setStudentStep("otp");
    } catch (err: any) {
      setStudentErrors({ ...studentErrors, email: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, otp, firstName, lastName, password } = studentFields;

    const errors = {
      otp: otp.length === 6 ? "" : "Invalid OTP",
      firstName: firstName.trim() ? "" : "First name is required",
      lastName: lastName.trim() ? "" : "Last name is required",
      password: validatePassword(password),
    };

    setStudentErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/student/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, firstName, lastName, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStudentErrors({ ...errors, otp: data.message || "Verification failed" });
        return;
      }

      const fullName = `${firstName} ${lastName}`;
      login({ _id: data.user.id, name: fullName, email, role: "student", isProfileComplete: true }, data.token);

      toast({ title: "Welcome, Student! 🎓", description: "Account verified successfully." });
      setLocation("/dashboard");
    } catch (err: any) {
      setStudentErrors({ ...errors, otp: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validateEmail(teacherFields.email);
    if (error) {
      setTeacherErrors({ ...teacherErrors, email: error });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/teacher/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: teacherFields.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTeacherErrors({ ...teacherErrors, email: data.message || "Failed to send OTP" });
        return;
      }

      toast({ title: "OTP Sent! 📧", description: "Please check your email for the verification code." });
      setTeacherStep("otp");
    } catch (err: any) {
      setTeacherErrors({ ...teacherErrors, email: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, otp, firstName, lastName, password } = teacherFields;

    const errors = {
      otp: otp.length === 6 ? "" : "Invalid OTP",
      firstName: firstName.trim() ? "" : "First name is required",
      lastName: lastName.trim() ? "" : "Last name is required",
      password: validatePassword(password),
    };

    setTeacherErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/teacher/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, firstName, lastName, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTeacherErrors({ ...errors, otp: data.message || "Verification failed" });
        return;
      }

      const fullName = `${firstName} ${lastName}`;
      login({ name: fullName, email, role: "teacher", isProfileComplete: false }, data.token);

      toast({ title: "Account Verified! 🍎", description: "Please complete your profile to continue." });
      setActiveView("teacher-onboarding");
    } catch (err: any) {
      setTeacherErrors({ ...errors, otp: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherOnboardingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { state, city, college, subject, profession, additionalInfo } = onboardingFields;

    const errors = {
      state: state.trim() ? "" : "State is required",
      city: city.trim() ? "" : "City is required",
      college: college.trim() ? "" : "College is required",
      subject: subject.trim() ? "" : "Subject is required",
      profession: profession.trim() ? "" : "Profession is required",
    };

    setOnboardingErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsLoading(true);
    try {
      const selectedCollege = availableColleges.find(c => c.name === college);
      const university = selectedCollege?.university || "";

      const res = await fetch("/api/auth/teacher/complete-profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ state, city, university, college, subject, profession, additionalInfo }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: data.message || "Failed to complete profile" });
        return;
      }

      if (user) {
        login({ ...user, isProfileComplete: true }, localStorage.getItem("token") || "");
      }

      toast({ title: "Welcome, Teacher! 🍎", description: "Profile completed successfully." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left side - Visual/Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={authBg}
            alt="Abstract educational technology"
            className="w-full h-full object-cover opacity-90 dark:opacity-50 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-900/40 to-transparent dark:from-slate-950 dark:via-slate-900/80 mix-blend-multiply" />
        </div>

        <div className="relative z-10 p-12 text-white">
          <div className="flex items-center gap-2 mb-12">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
              <BrainCircuit className="h-6 w-6 text-blue-200" />
            </div>
            <span className="text-xl font-bold tracking-tight font-sans">ExamAI</span>
          </div>

          <div className="max-w-md mt-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
              The smart way to build exams.
            </h1>
            <p className="text-lg text-blue-100/80 font-inter mb-8">
              Upload your study materials, and let our AI generate comprehensive exams, quizzes, and assessments in seconds.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <p className="text-sm font-medium text-blue-50">Generate MCQs, short & long answers instantly</p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <BookOpenCheck className="h-5 w-5 text-purple-300" />
                </div>
                <p className="text-sm font-medium text-purple-50">Process PDFs, DOCX, and image study notes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 rounded-full bg-blue-400/10 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 rounded-full bg-purple-400/10 blur-[80px]" />

        <div className="w-full max-w-md mx-auto relative z-10">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="bg-primary/10 p-2 rounded-xl">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">ExamAI</span>
          </div>

          <Tabs value={activeView} onValueChange={(val: any) => setActiveView(val)} className="w-full">
            <TabsContent value="teacher-login" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800">
                <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-inter">
                    Enter your email to sign in to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleLoginSubmit(e, 'teacher')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="teacher@college.edu"
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                        value={loginFields.email}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLoginFields({ ...loginFields, email: val });
                          if (loginErrors.email) {
                            setLoginErrors({ ...loginErrors, email: "" });
                          }
                        }}
                      />
                      {loginErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                        <button
                          type="button"
                          onClick={() => { setFpStep("email"); setFpEmail(loginFields.email); setFpError(""); setActiveView("forgot-password"); }}
                          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword.teacherLogin ? "text" : "password"}
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 pr-10 text-foreground"
                          value={loginFields.password}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLoginFields({ ...loginFields, password: val });

                            // Clear password error as user types
                            if (loginErrors.password) {
                              setLoginErrors({ ...loginErrors, password: "" });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("teacherLogin")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword.teacherLogin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginErrors.password && (
                        <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                      disabled={isLoading}
                      data-testid="button-login"
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-inter">
                    By clicking continue, you agree to our{" "}
                    <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Privacy Policy</a>.
                    <div className="mt-4 flex justify-between text-sm">
                      <button type="button" onClick={() => setActiveView("teacher-signup")} className="text-primary hover:underline">Register as Teacher</button>
                      <button type="button" onClick={() => setActiveView("admin-login")} className="text-slate-500 dark:text-slate-400 hover:underline">Admin Login</button>
                      <button type="button" onClick={() => setActiveView("student-login")} className="text-slate-500 dark:text-slate-400 hover:underline">I'm a Student</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teacher-signup" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800">
                <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Teacher Registration</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-inter">
                    {teacherStep === "email" ? "Enter your email to receive an OTP" : "Verify OTP and complete your profile"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherStep === "email" ? (
                    <form onSubmit={handleTeacherSendOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-reg-email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                        <Input
                          id="teacher-reg-email"
                          type="email"
                          placeholder="teacher@college.edu"
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                          value={teacherFields.email}
                          onChange={(e) => setTeacherFields({ ...teacherFields, email: e.target.value })}
                        />
                        {teacherErrors.email && <p className="text-red-500 text-sm">{teacherErrors.email}</p>}
                      </div>
                      <Button
                        type="submit"
                        className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleTeacherVerifyOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-otp" className="text-slate-700 dark:text-slate-300 font-medium">Enter 6-digit OTP</Label>
                        <Input
                          id="teacher-otp"
                          placeholder="123456"
                          maxLength={6}
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-center text-2xl tracking-[0.5em] font-bold text-foreground"
                          value={teacherFields.otp}
                          onChange={(e) => setTeacherFields({ ...teacherFields, otp: e.target.value })}
                        />
                        {teacherErrors.otp && <p className="text-red-500 text-sm">{teacherErrors.otp}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacher-first-name" className="text-slate-700 dark:text-slate-300 font-medium">First name</Label>
                          <Input
                            id="teacher-first-name"
                            placeholder="Jane"
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                            value={teacherFields.firstName}
                            onChange={(e) => setTeacherFields({ ...teacherFields, firstName: e.target.value })}
                          />
                          {teacherErrors.firstName && <p className="text-red-500 text-sm">{teacherErrors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher-last-name" className="text-slate-700 dark:text-slate-300 font-medium">Last name</Label>
                          <Input
                            id="teacher-last-name"
                            placeholder="Doe"
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                            value={teacherFields.lastName}
                            onChange={(e) => setTeacherFields({ ...teacherFields, lastName: e.target.value })}
                          />
                          {teacherErrors.lastName && <p className="text-red-500 text-sm">{teacherErrors.lastName}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-reg-password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="teacher-reg-password"
                            type={showPassword.teacherSignup ? "text" : "password"}
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 pr-10 text-foreground"
                            value={teacherFields.password}
                            onChange={(e) => setTeacherFields({ ...teacherFields, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("teacherSignup")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showPassword.teacherSignup ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {teacherErrors.password && <p className="text-red-500 text-sm">{teacherErrors.password}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="submit"
                          className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                          disabled={isLoading}
                        >
                          {isLoading ? "Verifying..." : "Complete Registration"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setTeacherStep("email")}
                          className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                          Back to Email
                        </Button>
                      </div>
                    </form>
                  )}
                  
                  <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-inter border-t pt-4 border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={() => setActiveView("teacher-login")} className="text-primary hover:underline">Already have an account? Login</button>
                    <div className="mt-2">
                      <button type="button" onClick={() => setActiveView("student-signup")} className="text-slate-500 dark:text-slate-400 hover:underline">I'm a Student</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="student-login" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800">
                <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Student Sign in</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-inter">
                    Enter your email to sign in to your student account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleLoginSubmit(e, 'student')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                      <Input
                        id="student-email"
                        name="email"
                        type="email"
                        placeholder="student@college.edu"
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                        value={loginFields.email}
                        onChange={(e) => {
                          setLoginFields({ ...loginFields, email: e.target.value });
                          if (loginErrors.email) setLoginErrors({ ...loginErrors, email: "" });
                        }}
                      />
                      {loginErrors.email && <p className="text-red-500 text-sm">{loginErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="student-password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                        <button
                          type="button"
                          onClick={() => { setFpStep("email"); setFpEmail(loginFields.email); setFpError(""); setActiveView("forgot-password"); }}
                          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="student-password"
                          name="password"
                          type={showPassword.studentLogin ? "text" : "password"}
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 pr-10 text-foreground"
                          value={loginFields.password}
                          onChange={(e) => {
                            setLoginFields({ ...loginFields, password: e.target.value });
                            if (loginErrors.password) setLoginErrors({ ...loginErrors, password: "" });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("studentLogin")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword.studentLogin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginErrors.password && <p className="text-red-500 text-sm">{loginErrors.password}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in as Student"}
                    </Button>
                  </form>
                  <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-inter border-t pt-4 border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <button type="button" onClick={() => setActiveView("student-signup")} className="text-primary hover:underline">Register as Student</button>
                      <button type="button" onClick={() => setActiveView("admin-login")} className="text-slate-500 dark:text-slate-400 hover:underline">Admin Login</button>
                      <button type="button" onClick={() => setActiveView("teacher-login")} className="text-slate-500 dark:text-slate-400 hover:underline">I'm a Teacher</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin-login" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800">
                <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                  <div className="flex items-center gap-2 mb-2 lg:justify-start justify-center">
                    <div className="bg-indigo-500/10 p-2 rounded-xl">
                      <ShieldCheck className="h-6 w-6 text-indigo-500" />
                    </div>
                    <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20">Administrator</Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Sign in</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-inter">
                    Enter your administrative credentials to access the portal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleLoginSubmit(e, 'admin')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                      <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        placeholder="admin@examai.com"
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                        value={loginFields.email}
                        onChange={(e) => {
                          setLoginFields({ ...loginFields, email: e.target.value });
                          if (loginErrors.email) setLoginErrors({ ...loginErrors, email: "" });
                        }}
                      />
                      {loginErrors.email && <p className="text-red-500 text-sm">{loginErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="admin-password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                        <button
                          type="button"
                          onClick={() => { setFpStep("email"); setFpEmail(loginFields.email); setFpError(""); setActiveView("forgot-password"); }}
                          className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          name="password"
                          type={showPassword.teacherLogin ? "text" : "password"}
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 pr-10 text-foreground"
                          value={loginFields.password}
                          onChange={(e) => {
                            setLoginFields({ ...loginFields, password: e.target.value });
                            if (loginErrors.password) setLoginErrors({ ...loginErrors, password: "" });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("teacherLogin")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword.teacherLogin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginErrors.password && <p className="text-red-500 text-sm">{loginErrors.password}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-300 active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Authenticating..." : "Login as Administrator"}
                    </Button>
                  </form>
                  <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-inter border-t pt-4 border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <button type="button" onClick={() => setActiveView("teacher-login")} className="text-primary hover:underline">I'm a Teacher</button>
                      <button type="button" onClick={() => setActiveView("student-login")} className="text-slate-500 dark:text-slate-400 hover:underline">I'm a Student</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="student-signup" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800">
                <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Student Registration</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-inter">
                    {studentStep === "email" ? "Enter your email to receive an OTP" : "Verify OTP and complete your profile"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentStep === "email" ? (
                    <form onSubmit={handleStudentSendOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-reg-email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                        <Input
                          id="student-reg-email"
                          type="email"
                          placeholder="student@college.edu"
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                          value={studentFields.email}
                          onChange={(e) => setStudentFields({ ...studentFields, email: e.target.value })}
                        />
                        {studentErrors.email && <p className="text-red-500 text-sm">{studentErrors.email}</p>}
                      </div>
                      <Button
                        type="submit"
                        className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleStudentVerifyOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-otp" className="text-slate-700 dark:text-slate-300 font-medium">Enter 6-digit OTP</Label>
                        <Input
                          id="student-otp"
                          placeholder="123456"
                          maxLength={6}
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-center text-2xl tracking-[0.5em] font-bold text-foreground"
                          value={studentFields.otp}
                          onChange={(e) => setStudentFields({ ...studentFields, otp: e.target.value })}
                        />
                        {studentErrors.otp && <p className="text-red-500 text-sm">{studentErrors.otp}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-first-name" className="text-slate-700 dark:text-slate-300 font-medium">First name</Label>
                          <Input
                            id="student-first-name"
                            placeholder="Jane"
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                            value={studentFields.firstName}
                            onChange={(e) => setStudentFields({ ...studentFields, firstName: e.target.value })}
                          />
                          {studentErrors.firstName && <p className="text-red-500 text-sm">{studentErrors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-last-name" className="text-slate-700 dark:text-slate-300 font-medium">Last name</Label>
                          <Input
                            id="student-last-name"
                            placeholder="Doe"
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                            value={studentFields.lastName}
                            onChange={(e) => setStudentFields({ ...studentFields, lastName: e.target.value })}
                          />
                          {studentErrors.lastName && <p className="text-red-500 text-sm">{studentErrors.lastName}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-reg-password" className="text-slate-700 dark:text-slate-300 font-medium">Create Password</Label>
                        <div className="relative">
                          <Input
                            id="student-reg-password"
                            type={showPassword.studentSignup ? "text" : "password"}
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 pr-10 text-foreground"
                            value={studentFields.password}
                            onChange={(e) => setStudentFields({ ...studentFields, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("studentSignup")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showPassword.studentSignup ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {studentErrors.password && <p className="text-red-500 text-sm">{studentErrors.password}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="submit"
                          className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                          disabled={isLoading}
                        >
                          {isLoading ? "Verifying..." : "Verify & Complete Signup"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setStudentStep("email")}
                          className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                          Back to Email
                        </Button>
                      </div>
                    </form>
                  )}
                  <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-inter border-t pt-4 border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <button type="button" onClick={() => setActiveView("student-login")} className="text-primary hover:underline">Already have an account? Login</button>
                      <button type="button" onClick={() => setActiveView("teacher-signup")} className="text-slate-500 dark:text-slate-400 hover:underline">I'm a Teacher</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teacher-onboarding" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800">
                <CardHeader className="space-y-1 pb-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="bg-primary/10 p-2 rounded-xl">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Complete Your Profile</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-inter text-sm">
                    🔒 Required before accessing the dashboard. This information helps personalize your teaching experience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTeacherOnboardingSubmit} className="space-y-4">

                    {/* State */}
                    <div className="space-y-2">
                      <Label htmlFor="onboarding-state" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> State <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <select
                          id="onboarding-state"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-11 px-3 text-sm text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
                          value={onboardingFields.state}
                          onChange={(e) => {
                            setOnboardingFields({ ...onboardingFields, state: e.target.value, city: "", college: "" });
                            if (onboardingErrors.state) setOnboardingErrors({ ...onboardingErrors, state: "" });
                          }}
                        >
                          <option value="" className="dark:bg-slate-950">-- Select State --</option>
                          {indianStates.map(s => (
                            <option key={s} value={s} className="dark:bg-slate-950">{s}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▼</div>
                      </div>
                      {onboardingErrors.state && <p className="text-red-500 text-xs">{onboardingErrors.state}</p>}
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label htmlFor="onboarding-city" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> City <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <select
                          id="onboarding-city"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-11 px-3 text-sm text-slate-800 dark:text-slate-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          value={onboardingFields.city}
                          disabled={!onboardingFields.state}
                          onChange={(e) => {
                            setOnboardingFields({ ...onboardingFields, city: e.target.value, college: "" });
                            if (onboardingErrors.city) setOnboardingErrors({ ...onboardingErrors, city: "" });
                          }}
                        >
                          <option value="" className="dark:bg-slate-950">{onboardingFields.state ? "-- Select City --" : "-- Select State first --"}</option>
                          {availableCities.map(c => (
                            <option key={c} value={c} className="dark:bg-slate-950">{c}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▼</div>
                      </div>
                      {onboardingErrors.city && <p className="text-red-500 text-xs">{onboardingErrors.city}</p>}
                    </div>

                    {/* College */}
                    <div className="space-y-2">
                      <Label htmlFor="onboarding-college" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" /> College / Institution <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <select
                          id="onboarding-college"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-11 px-3 text-sm text-slate-800 dark:text-slate-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          value={onboardingFields.college}
                          disabled={!onboardingFields.city}
                          onChange={(e) => {
                            setOnboardingFields({ ...onboardingFields, college: e.target.value });
                            if (onboardingErrors.college) setOnboardingErrors({ ...onboardingErrors, college: "" });
                          }}
                        >
                          <option value="" className="dark:bg-slate-950">{onboardingFields.city ? "-- Select College --" : "-- Select City first --"}</option>
                          {availableColleges.map(c => (
                            <option key={c.name} value={c.name} className="dark:bg-slate-950">{c.name}{c.university ? ` (${c.university})` : ""}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▼</div>
                      </div>
                      {onboardingErrors.college && <p className="text-red-500 text-xs">{onboardingErrors.college}</p>}
                    </div>

                    {/* Subject & Profession in a grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="onboarding-subject" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-primary" /> Subject <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="onboarding-subject"
                          placeholder="e.g. Mathematics"
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-primary/20 h-11 text-foreground"
                          value={onboardingFields.subject}
                          onChange={(e) => {
                            setOnboardingFields({ ...onboardingFields, subject: e.target.value });
                            if (onboardingErrors.subject) setOnboardingErrors({ ...onboardingErrors, subject: "" });
                          }}
                        />
                        {onboardingErrors.subject && <p className="text-red-500 text-xs">{onboardingErrors.subject}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="onboarding-profession" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-primary" /> Profession <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="onboarding-profession"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-11 px-3 text-sm text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
                            value={onboardingFields.profession}
                            onChange={(e) => {
                              setOnboardingFields({ ...onboardingFields, profession: e.target.value });
                              if (onboardingErrors.profession) setOnboardingErrors({ ...onboardingErrors, profession: "" });
                            }}
                          >
                            <option value="" className="dark:bg-slate-950">-- Select --</option>
                            <option className="dark:bg-slate-950">Professor</option>
                            <option className="dark:bg-slate-950">Associate Professor</option>
                            <option className="dark:bg-slate-950">Assistant Professor</option>
                            <option className="dark:bg-slate-950">Lecturer</option>
                            <option className="dark:bg-slate-950">Teaching Assistant</option>
                            <option className="dark:bg-slate-950">Adjunct Faculty</option>
                            <option className="dark:bg-slate-950">Principal / HOD</option>
                            <option className="dark:bg-slate-950">Other</option>
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▼</div>
                        </div>
                        {onboardingErrors.profession && <p className="text-red-500 text-xs">{onboardingErrors.profession}</p>}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2">
                      <Label htmlFor="onboarding-additional" className="text-slate-700 dark:text-slate-300 font-medium">
                        About Yourself <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(Optional)</span>
                      </Label>
                      <textarea
                        id="onboarding-additional"
                        rows={2}
                        placeholder="Brief bio, specializations, years of experience..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 resize-none"
                        value={onboardingFields.additionalInfo}
                        onChange={(e) => setOnboardingFields({ ...onboardingFields, additionalInfo: e.target.value })}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving Profile..." : "Complete & Go to Dashboard →"}
                    </Button>

                    <p className="text-center text-xs text-slate-400">
                      🔒 This data is saved securely to our servers. Local storage changes cannot affect it.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Forgot Password ─────────────────────────── */}
            <TabsContent value="forgot-password" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800">
                <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                  <div className="flex items-center gap-2 mb-2 lg:justify-start justify-center">
                    <div className="bg-amber-500/10 p-2 rounded-xl">
                      <KeyRound className="h-6 w-6 text-amber-500" />
                    </div>
                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20">
                      {fpStep === "email" ? "Step 1 of 3" : fpStep === "otp" ? "Step 2 of 3" : "Step 3 of 3"}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {fpStep === "email" ? "Forgot Password" : fpStep === "otp" ? "Verify OTP" : "Set New Password"}
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-inter">
                    {fpStep === "email"
                      ? "Enter your registered email to receive a 6-digit OTP"
                      : fpStep === "otp"
                      ? `We sent a 6-digit OTP to ${fpEmail}`
                      : "Choose a strong new password for your account"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Step 1: Email */}
                  {fpStep === "email" && (
                    <form onSubmit={handleForgotSendOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fp-email" className="text-slate-700 dark:text-slate-300 font-medium">Registered Email</Label>
                        <Input
                          id="fp-email"
                          type="email"
                          placeholder="your@email.com"
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm h-11 text-foreground"
                          value={fpEmail}
                          onChange={(e) => { setFpEmail(e.target.value); setFpError(""); }}
                        />
                        {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
                      </div>
                      <Button
                        type="submit"
                        className="w-full rounded-xl h-11 text-base font-semibold bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all duration-300 active:scale-[0.98] text-white"
                        disabled={fpLoading}
                      >
                        {fpLoading ? "Sending OTP..." : "Send OTP to Email"}
                      </Button>
                    </form>
                  )}

                  {/* Step 2: OTP */}
                  {fpStep === "otp" && (
                    <form onSubmit={handleForgotVerifyOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fp-otp" className="text-slate-700 dark:text-slate-300 font-medium">Enter 6-digit OTP</Label>
                        <Input
                          id="fp-otp"
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 482931"
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm h-11 text-foreground tracking-[0.4em] text-center text-xl font-bold"
                          value={fpOtp}
                          onChange={(e) => { setFpOtp(e.target.value.replace(/\D/g, "")); setFpError(""); }}
                        />
                        {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
                      </div>
                      <Button
                        type="submit"
                        className="w-full rounded-xl h-11 text-base font-semibold bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all duration-300 active:scale-[0.98] text-white"
                      >
                        Verify OTP
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleForgotSendOTP({ preventDefault: () => {} } as any)}
                        className="w-full text-center text-sm text-slate-500 hover:text-primary transition-colors"
                      >
                        Didn't receive? Resend OTP
                      </button>
                    </form>
                  )}

                  {/* Step 3: New Password */}
                  {fpStep === "reset" && (
                    <form onSubmit={handleForgotResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fp-new-password" className="text-slate-700 dark:text-slate-300 font-medium">New Password</Label>
                        <div className="relative">
                          <Input
                            id="fp-new-password"
                            type={showFpPassword ? "text" : "password"}
                            placeholder="Min. 6 characters"
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm h-11 pr-10 text-foreground"
                            value={fpNewPassword}
                            onChange={(e) => { setFpNewPassword(e.target.value); setFpError(""); }}
                          />
                          <button type="button" onClick={() => setShowFpPassword(!showFpPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showFpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fp-confirm-password" className="text-slate-700 dark:text-slate-300 font-medium">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="fp-confirm-password"
                            type={showFpConfirm ? "text" : "password"}
                            placeholder="Re-enter your new password"
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm h-11 pr-10 text-foreground"
                            value={fpConfirmPassword}
                            onChange={(e) => { setFpConfirmPassword(e.target.value); setFpError(""); }}
                          />
                          <button type="button" onClick={() => setShowFpConfirm(!showFpConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showFpConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
                      </div>
                      <Button
                        type="submit"
                        className="w-full rounded-xl h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all duration-300 active:scale-[0.98] text-white"
                        disabled={fpLoading}
                      >
                        {fpLoading ? "Resetting..." : "Reset Password"}
                      </Button>
                    </form>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <button
                      type="button"
                      onClick={() => { setActiveView("teacher-login"); setFpStep("email"); setFpError(""); }}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

        </div>
      </div>
    </div>
  );
}