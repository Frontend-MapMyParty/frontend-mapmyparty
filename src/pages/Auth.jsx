 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Building2, UserCog, Loader2, Eye, EyeOff, ArrowLeft, Sparkles, Star, Music, MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, buildUrl } from "@/config/api";
import { resetSessionCache, fetchSession } from "@/utils/auth";
import OTPVerificationModal from "@/components/OTPVerificationModal";
import Logo from "../assets/android-chrome-192x192.png";

const Auth = () => {
  const navigate = useNavigate();
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
  const [showPromoterPassword, setShowPromoterPassword] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          className="absolute top-6 left-6 text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-lg z-20"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back 
        </Button>

        {/* Promoter Login Button */}
        <div className="absolute top-6 right-6 z-20">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePromoterLogin}
            className="border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-500/10 text-purple-200 hover:text-purple-100 backdrop-blur-sm rounded-lg"
          >
            <UserCog className="w-4 h-4 mr-2" />
            Promoter Access
          </Button>
        </div>

        <div className="w-full max-w-3xl relative z-10">
          {/* Logo and Welcome */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/25">
                  <img src={Logo} alt="MapMyParty" className="w-10 h-10" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl blur opacity-25 -z-10"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Welcome to
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> MapMyParty</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
              Your ultimate destination for discovering, creating, and managing unforgettable events
            </p>
          </div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:scale-105 relative overflow-hidden"
              onClick={() => setUserType("user")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 border border-purple-500/20">
                  <User className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">I'm an Attendee</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Discover and book tickets to amazing events near you
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-400 font-medium">
                  <span>Explore Events</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:scale-105 relative overflow-hidden"
              onClick={() => setUserType("organizer")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 border border-pink-500/20">
                  <Building2 className="w-10 h-10 text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">I'm an Organizer</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Create and manage your own events with ease
                </p>
                <div className="flex items-center justify-center gap-2 text-pink-400 font-medium">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-lg z-20"
        onClick={() => setUserType(null)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="w-full max-w-md relative z-10">
        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/25">
                  <img src={Logo} alt="MapMyParty" className="w-8 h-8" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl blur opacity-25 -z-10"></div>
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-white">
              {userType === "organizer"
                ? "Organizer"
                : userType === "promoter"
                ? "Promoter"
                : "Attendee"}{" "}
              Account
            </CardTitle>
            <CardDescription className="text-gray-300 mt-1 text-sm">
              {isLogin
                ? "Welcome back! Sign in to continue"
                : "Create your account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {userType === "promoter" ? (
              <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200 font-medium text-sm">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    required 
                    className="border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-10 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200 font-medium text-sm">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPromoterPassword ? "text" : "password"} 
                      placeholder="Enter your password" 
                      required 
                      className="border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 pr-10 h-10 backdrop-blur-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-purple-300"
                      onClick={() => setShowPromoterPassword(!showPromoterPassword)}
                    >
                      {showPromoterPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-10 font-medium shadow-xl shadow-purple-500/25 transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            ) : (
              <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 p-1 rounded-lg backdrop-blur-sm">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:shadow-sm text-gray-200 font-medium rounded-md transition-all duration-300 text-sm"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:shadow-sm text-gray-200 font-medium rounded-md transition-all duration-300 text-sm"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-200 font-medium text-sm">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        className="border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-10 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-200 font-medium text-sm">Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showLoginPassword ? "text" : "password"} 
                          placeholder="Enter your password" 
                          required 
                          className="border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 pr-10 h-10 backdrop-blur-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-purple-300"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-10 font-medium shadow-xl shadow-purple-500/25 transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                  
                  {/* Google Login Button - Only for Attendee */}
                  {userType === "user" && (
                    <div className="mt-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-purple-500/30" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-transparent px-3 text-gray-400 font-medium">Or continue with</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-500/10 text-gray-300 hover:text-white h-10 font-medium backdrop-blur-sm transition-all duration-300"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-200 font-medium text-sm">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter your full name" 
                        required 
                        className="border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-10 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-200 font-medium text-sm">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        className="border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-10 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-gray-200 font-medium text-sm">Phone Number</Label>
                      <Input 
                        id="signup-phone" 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        required 
                        className="border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-10 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-200 font-medium text-sm">Password</Label>
                      <div className="relative">
                        <Input 
                          id="signup-password" 
                          type={showSignupPassword ? "text" : "password"} 
                          placeholder="Create a password" 
                          required 
                          className="border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 pr-10 h-10 backdrop-blur-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-purple-300"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-10 font-medium shadow-xl shadow-purple-500/25 transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
