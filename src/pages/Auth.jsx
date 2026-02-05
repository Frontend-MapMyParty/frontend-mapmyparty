import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, User, Building2, UserCog, Loader2, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, buildUrl } from "@/config/api";
import { resetSessionCache, fetchSession } from "@/utils/auth";
import OTPVerificationModal from "@/components/OTPVerificationModal";

const Auth = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // OTP verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [pendingSignupType, setPendingSignupType] = useState(null);

  const handleSubmit = async (e, type) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const isPromoter = type === "promoter";
      const mode = isPromoter || isLogin ? "login" : "signup";
      const roleMap = { user: "USER", organizer: "ORGANIZER", promoter: "PROMOTER" };
      const role = roleMap[type] || "USER";

      if (mode === "login") {
        const email = form.querySelector("#email")?.value?.trim();
        const password = form.querySelector("#password")?.value;
        if (!email || !password) {
          toast.error("Please enter email and password");
          return;
        }
        setIsLoading(true);

        await apiFetch("auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password, role }),
        });

        // Reset cache and fetch fresh session from backend
        resetSessionCache();

        // Validate session - backend cookies are now set
        const session = await fetchSession(true);

        if (!session?.isAuthenticated) {
          throw new Error("Login succeeded but session validation failed");
        }

        toast.success("Logged in successfully!");

        // Navigate after session is established
        const dashboardPath =
          type === "organizer"
            ? "/organizer/dashboard-v2"
            : type === "promoter"
              ? "/promoter"
              : "/dashboard";

        navigate(dashboardPath, { replace: true });
        return;
      } else {
        // SIGNUP FLOW - Send OTP first for email verification
        const name = form.querySelector("#name")?.value?.trim();
        const email = form.querySelector("#signup-email")?.value?.trim();
        const phone = form.querySelector("#signup-phone")?.value?.trim();
        const password = form.querySelector("#signup-password")?.value;
        if (!name || !email || !phone || !password) {
          toast.error("Please fill all fields");
          return;
        }
        const phoneDigits = (phone || "").replace(/\D/g, "");
        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
          toast.error("Please enter a valid phone number");
          return;
        }

        // Validate password requirements
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          toast.error(
            "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
          );
          return;
        }

        setIsLoading(true);

        // Send OTP for email verification
        await apiFetch("auth/send-signup-otp", {
          method: "POST",
          body: JSON.stringify({ name, email, phone: phoneDigits, password, role }),
        });

        // Store pending signup info and show OTP modal
        setOtpEmail(email);
        setPendingSignupType(type);
        setShowOtpModal(true);
        setIsLoading(false);

        toast.success("Verification code sent to your email!");
        return; // Don't proceed further - wait for OTP verification
      }
    } catch (err) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoterLogin = () => {
    // Directly mark promoter as authenticated (guest) and redirect to dashboard
    sessionStorage.setItem("isAuthenticated", "true");
    sessionStorage.setItem("role", "PROMOTER");
    sessionStorage.setItem("userType", "promoter");
    sessionStorage.setItem("authProvider", "promoter-guest");
    sessionStorage.setItem("promoterGuest", "true");

    const guestProfile = {
      role: "PROMOTER",
      type: "promoter",
      name: "Promoter Guest",
      authProvider: "promoter-guest",
    };

    try {
      sessionStorage.setItem("userProfile", JSON.stringify(guestProfile));
    } catch (err) {
      console.warn("Unable to persist promoter guest profile", err);
    }

    navigate("/promoter", { replace: true });
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    // Backend will handle OAuth and redirect to /dashboard?auth=success
    const googleAuthUrl = buildUrl("auth/google");
    window.location.href = googleAuthUrl;
  };

  // Handle OTP verification success
  const handleOtpVerificationSuccess = async () => {
    const signupType = pendingSignupType;

    // Close OTP modal
    setShowOtpModal(false);
    setOtpEmail("");
    setPendingSignupType(null);

    // Reset cache and fetch fresh session from backend
    resetSessionCache();

    // Validate session - backend cookies are now set after OTP verification
    const session = await fetchSession(true);

    if (!session?.isAuthenticated) {
      toast.error("Signup succeeded but session validation failed. Please try logging in.");
      return;
    }

    toast.success("Account created successfully!");

    // Navigate to dashboard
    const dashboardPath =
      signupType === "organizer"
        ? "/organizer/dashboard-v2"
        : signupType === "promoter"
          ? "/promoter/dashboard"
          : "/dashboard";

    navigate(dashboardPath, { replace: true });
  };

  // Handle OTP modal close
  const handleOtpModalClose = () => {
    setShowOtpModal(false);
    // Don't clear email so user can retry if they close accidentally
  };

  if (!userType) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#0f0619] via-[#1f0e35] to-[#0f0619]">
        {/* Animated Background Particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: Math.random() * 6 + 4 + "px",
                height: Math.random() * 6 + 4 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                background: `radial-gradient(circle, ${
                  Math.random() > 0.5 ? "rgba(124, 58, 237, 0.4)" : "rgba(236, 72, 153, 0.4)"
                }, transparent)`,
                filter: "blur(2px)",
                animationDelay: Math.random() * 3 + "s",
                animationDuration: Math.random() * 4 + 3 + "s",
              }}
            />
          ))}
        </div>

        {/* Large Glowing Orbs */}
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "3s" }} />

        <div className="w-full max-w-6xl relative z-10">
          {/* Promoter Login Button */}
          <div className="absolute -top-16 right-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePromoterLogin}
              className="gap-2 text-white/70 hover:text-white border border-white/10 hover:bg-white/5 backdrop-blur-xl rounded-full transition-all duration-300"
            >
              <UserCog className="w-4 h-4" />
              Login as Promoter
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.6)]">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome to MapMyParty
              </span>
            </h1>
            <p className="text-white/70 text-xl">
              Choose how you'd like to continue
            </p>
          </div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Attendee Card */}
            <div
              className="group cursor-pointer"
              onClick={() => setUserType("user")}
            >
              <div className="relative h-full bg-white/5 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-8 hover:bg-white/10 hover:border-purple-500/60 hover:shadow-[0_0_60px_rgba(124,58,237,0.4)] hover:-translate-y-2 transition-all duration-300">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 text-center space-y-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(124,58,237,0.5)] group-hover:shadow-[0_0_50px_rgba(124,58,237,0.8)] group-hover:scale-110 transition-all duration-300">
                    <User className="w-10 h-10 text-white" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">I'm an Attendee</h2>
                    <p className="text-gray-400 text-lg">
                      Discover and book tickets to amazing events
                    </p>
                  </div>

                  <ul className="text-left space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Browse thousands of events</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Secure ticket booking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Manage your tickets</span>
                    </li>
                  </ul>

                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-4 transition-all duration-300">
                      Continue as Attendee
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Card */}
            <div
              className="group cursor-pointer"
              onClick={() => setUserType("organizer")}
            >
              <div className="relative h-full bg-white/5 backdrop-blur-xl border-2 border-pink-500/30 rounded-3xl p-8 hover:bg-white/10 hover:border-pink-500/60 hover:shadow-[0_0_60px_rgba(236,72,153,0.4)] hover:-translate-y-2 transition-all duration-300">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 text-center space-y-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(236,72,153,0.5)] group-hover:shadow-[0_0_50px_rgba(236,72,153,0.8)] group-hover:scale-110 transition-all duration-300">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">I'm an Organizer</h2>
                    <p className="text-gray-400 text-lg">
                      Create and manage your own events
                    </p>
                  </div>

                  <ul className="text-left space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                      <span>Create unlimited events</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                      <span>Track sales and analytics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                      <span>Manage your team</span>
                    </li>
                  </ul>

                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 text-pink-400 font-semibold group-hover:gap-4 transition-all duration-300">
                      Continue as Organizer
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-10">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#0f0619] via-[#1f0e35] to-[#0f0619]">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 6 + 4 + "px",
              height: Math.random() * 6 + 4 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background: `radial-gradient(circle, ${
                Math.random() > 0.5 ? "rgba(124, 58, 237, 0.4)" : "rgba(236, 72, 153, 0.4)"
              }, transparent)`,
              filter: "blur(2px)",
              animationDelay: Math.random() * 3 + "s",
              animationDuration: Math.random() * 4 + 3 + "s",
            }}
          />
        ))}
      </div>

      {/* Large Glowing Orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="w-full max-w-md relative z-10">
        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Header */}
          <div className="text-center pt-10 pb-8 px-8 border-b border-white/10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {userType === "organizer"
                ? "Organizer"
                : userType === "promoter"
                ? "Promoter"
                : "Attendee"}{" "}
              Account
            </h2>
            <p className="text-gray-400">
              {isLogin
                ? "Welcome back! Sign in to your account"
                : "Create your account to get started"}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {userType === "promoter" ? (
              <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl h-12"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            ) : (
              <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 border border-white/10 p-1 rounded-xl h-12">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(124,58,237,0.4)] text-gray-400 font-medium transition-all duration-300"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-700 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(236,72,153,0.4)] text-gray-400 font-medium transition-all duration-300"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-5">
                  <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl h-12"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  {/* Google Login Button - Only for Attendee */}
                  {userType === "user" && (
                    <div>
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-transparent px-3 text-gray-400 font-medium">Or continue with</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-xl font-medium transition-all duration-300"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                      >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Sign in with Google
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="signup" className="space-y-5">
                  <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white text-sm font-medium">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white text-sm font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-white text-sm font-medium">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white text-sm font-medium">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 rounded-xl h-12"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Min 8 characters with uppercase, lowercase, number & special character
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setUserType(null)}
                className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
              >
                ← Choose different account type
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOtpModal}
        onClose={handleOtpModalClose}
        email={otpEmail}
        onVerificationSuccess={handleOtpVerificationSuccess}
        expiryMinutes={10}
      />
    </div>
  );
};

export default Auth;
