 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Building2, Loader2, Eye, EyeOff, ArrowLeft, Sparkles, Star, Music, MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, buildUrl } from "@/config/api";
import { resetSessionCache, fetchSession } from "@/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
import OTPVerificationModal from "@/components/OTPVerificationModal";
import Logo from "../assets/android-chrome-192x192.png";

const Auth = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();
  const [userType, setUserType] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // OTP verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [pendingSignupType, setPendingSignupType] = useState(null);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleSubmit = async (e, type) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const mode = isLogin ? "login" : "signup";
      const roleMap = { user: "USER", organizer: "ORGANIZER" };
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

        // Populate auth context before navigating
        contextLogin(session);

        toast.success("Logged in successfully!");

        // Navigate after session is established
        const dashboardPath =
          type === "organizer"
            ? "/organizer/dashboard-v2"
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

    // Populate auth context before navigating
    contextLogin(session);

    toast.success("Account created successfully!");

    // Navigate to dashboard
    const dashboardPath =
      signupType === "organizer"
        ? "/organizer/dashboard-v2"
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="absolute top-6 left-6 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back 
        </Button>

        <div className="w-full max-w-3xl">
          {/* Logo and Welcome */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-800">
                <img src={Logo} alt="MapMyParty" className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Welcome to <span className="text-red-500">MapMyParty</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Your ultimate destination for discovering, creating, and managing unforgettable events
            </p>
          </div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <Card
              className="group cursor-pointer border border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800 transition-all duration-300"
              onClick={() => setUserType("user")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-700 transition-colors">
                  <User className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">I'm an Attendee</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Discover and book tickets to amazing events near you
                </p>
                <div className="flex items-center justify-center gap-2 text-red-500 font-medium text-sm">
                  <span>Explore Events</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer border border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800 transition-all duration-300"
              onClick={() => setUserType("organizer")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-700 transition-colors">
                  <Building2 className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">I'm an Organizer</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Create and manage your own events with ease
                </p>
                <div className="flex items-center justify-center gap-2 text-red-500 font-medium text-sm">
                  <span>Start Creating</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg"
        onClick={() => setUserType(null)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="w-full max-w-sm">
        <Card className="border border-gray-800 bg-gray-900 shadow-xl">
          <CardHeader className="text-center pb-5 pt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                <img src={Logo} alt="MapMyParty" className="w-9 h-9" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              {userType === "organizer" ? "Organizer" : "Attendee"}{" "}
              Account
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">
              {isLogin
                ? "Welcome back! Sign in to continue"
                : "Create your account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-5 bg-gray-800 p-1 rounded-lg h-10">
                  <TabsTrigger value="login" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-sm font-medium rounded-md">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-sm font-medium rounded-md">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-0">
                  <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-red-500 h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showLoginPassword ? "text" : "password"} 
                          placeholder="Enter your password" 
                          required 
                          className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-red-500 pr-10 h-10 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white h-10 text-sm font-medium mt-1" 
                      disabled={isLoading}
                    >
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</> : "Sign In"}
                    </Button>
                  </form>
                  
                  {/* Google Login Button - Only for Attendee */}
                  {userType === "user" && (
                    <div className="mt-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-gray-900 px-2 text-gray-500 text-xs uppercase">Or continue with</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-gray-300 h-10 text-sm font-medium"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-0">
                  <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300 text-sm font-medium">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter your full name" 
                        required 
                        className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-red-500 h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-300 text-sm font-medium">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-red-500 h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-gray-300 text-sm font-medium">Phone Number</Label>
                      <Input 
                        id="signup-phone" 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        required 
                        className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-red-500 h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-300 text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input 
                          id="signup-password" 
                          type={showSignupPassword ? "text" : "password"} 
                          placeholder="Create a password" 
                          required 
                          className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-red-500 pr-10 h-10 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white h-10 text-sm font-medium mt-1"
                      disabled={isLoading}
                    >
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : "Create Account"}
                    </Button>
                  </form>

                  {/* Google Signup Button - Only for Attendee */}
                  {userType === "user" && (
                    <div className="mt-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-gray-900 px-2 text-gray-500 text-xs uppercase">Or continue with</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-gray-300 h-10 text-sm font-medium"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign up with Google
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
          </CardContent>
        </Card>

        {/* OTP Verification Modal */}
        <OTPVerificationModal
          isOpen={showOtpModal}
          onClose={handleOtpModalClose}
          email={otpEmail}
          onVerificationSuccess={handleOtpVerificationSuccess}
          expiryMinutes={10}
        />
      </div>
    </div>
  );
};

export default Auth;