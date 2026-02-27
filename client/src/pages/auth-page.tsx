import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Sparkles, BookOpenCheck } from "lucide-react";
import authBg from "../assets/images/auth-bg.png";
import { toast } from "../hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loginFields, setLoginFields] = useState({ email: "", password: "" });

  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

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

  interface LoginResponse {
    token: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    message?: string;
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const res = await fetch("http://192.168.1.13:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        setLoginErrors({ ...errors, password: data.message || "Login failed" });
        return;
      }

      const generatedName = email
        .split("@")[0]
        .replace(/\./g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const newUser = {
        name: generatedName,
        email,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", data.token);

      toast({
        title: "Login successful 🎉",
        description: `Welcome back, ${generatedName}!`,
      });

      setLocation("/dashboard");
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
      const res = await fetch("http://192.168.1.13:5000/api/auth/register", {
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
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      toast({
        title: "Account created successfully 🎉",
        description: "You can now log in with your new account.",
      });

      setLocation("/");
    } catch (err: any) {
      setSignupErrors({ ...errors, password: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50/50">
      {/* Left side - Visual/Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={authBg}
            alt="Abstract educational technology"
            className="w-full h-full object-cover opacity-90 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-900/40 to-transparent mix-blend-multiply" />
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
            <span className="text-xl font-bold tracking-tight text-slate-900">ExamAI</span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/50">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:shadow-sm data-[state=active]:bg-white font-medium" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:shadow-sm data-[state=active]:bg-white font-medium" data-testid="tab-signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-0 shadow-xl shadow-slate-200/40 rounded-2xl bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</CardTitle>
                  <CardDescription className="text-slate-500 font-inter">
                    Enter your email to sign in to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="teacher@college.edu"
                        className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 h-11"
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
                        <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                        <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 h-11"
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

                  <div className="mt-6 text-center text-sm text-slate-500 font-inter">
                    By clicking continue, you agree to our{" "}
                    <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Privacy Policy</a>.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-0 shadow-xl shadow-slate-200/40 rounded-2xl bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Create an account</CardTitle>
                  <CardDescription className="text-slate-500 font-inter">
                    Start generating exams for your students today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name" className="text-slate-700 font-medium">First name</Label>
                        <Input
                          id="first-name"
                          name="firstName"
                          placeholder="Jane"
                          // required
                          className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 h-11"
                          value={signupValues.firstName}
                          onChange={(e) => {
                            setSignupValues({ ...signupValues, firstName: e.target.value });
                            if (signupErrors.firstName) setSignupErrors({ ...signupErrors, firstName: "" });
                          }}
                        />
                        {signupErrors.firstName && <p className="text-red-500 text-sm">{signupErrors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name" className="text-slate-700 font-medium">Last name</Label>
                        <Input
                          id="last-name"
                          name="lastName"
                          placeholder="Doe"
                          // required
                          className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 h-11"
                          value={signupValues.lastName}
                          onChange={(e) => {
                            setSignupValues({ ...signupValues, lastName: e.target.value });
                            if (signupErrors.lastName) setSignupErrors({ ...signupErrors, lastName: "" });
                          }}
                        />
                        {signupErrors.lastName && <p className="text-red-500 text-sm">{signupErrors.lastName}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution" className="text-slate-700 font-medium">Institution / College</Label>
                      <Input
                        id="institution"
                        placeholder="State University"
                        // required
                        className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 h-11"
                        onChange={(e) => {
                          setSignupValues({ ...signupValues, institution: e.target.value });
                          if (signupErrors.institution) setSignupErrors({ ...signupErrors, institution: "" });
                        }}
                      />
                      {signupErrors.institution && <p className="text-red-500 text-sm">{signupErrors.institution}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-700 font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="teacher@college.edu"
                        // required
                        className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 h-11"
                        onChange={(e) => {
                          setSignupValues({ ...signupValues, email: e.target.value });
                          if (signupErrors.email) setSignupErrors({ ...signupErrors, email: "" });
                        }}
                      />
                      {signupErrors.email && <p className="text-red-500 text-sm">{signupErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-700 font-medium">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        // required
                        className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 h-11"
                        onChange={(e) => {
                          setSignupValues({ ...signupValues, password: e.target.value });
                          if (signupErrors.password) setSignupErrors({ ...signupErrors, password: "" });
                        }}
                      />
                      {signupErrors.password && <p className="text-red-500 text-sm">{signupErrors.password}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl h-11 text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98] mt-2"
                      disabled={isLoading}
                      data-testid="button-signup"
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}