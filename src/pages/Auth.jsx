 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Building2, UserCog, Loader2 } from "lucide-react";
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

  const persistUserProfile = (userData = {}, fallback = {}) => {
    if (!userData || typeof userData !== "object") {
      userData = {};
    }

    const merged = {
      ...fallback,
      ...userData,
    };

    const sanitized = Object.fromEntries(
      Object.entries(merged).filter(([, value]) => value !== undefined && value !== null && value !== "")
    );

    if (Object.keys(sanitized).length === 0) {
      return;
    }

    try {
      sessionStorage.setItem("userProfile", JSON.stringify(sanitized));
    } catch (storageError) {
      console.warn("⚠️ Failed to persist user profile in sessionStorage", storageError);
    }

    if (sanitized.name) sessionStorage.setItem("userName", sanitized.name);
    if (sanitized.email) sessionStorage.setItem("userEmail", sanitized.email);
    if (sanitized.phone || sanitized.phoneNumber) {
      sessionStorage.setItem("userPhone", sanitized.phone || sanitized.phoneNumber);
    }
    if (sanitized.authProvider) {
      sessionStorage.setItem("authProvider", sanitized.authProvider);
    }
    if (sanitized.hasPassword !== undefined) {
      sessionStorage.setItem("hasPassword", sanitized.hasPassword ? "true" : "false");
    }
  };

  const extractUserFromResponse = (payload) => {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    if (payload.user && typeof payload.user === "object") {
      return payload.user;
    }

    if (payload.data && typeof payload.data === "object") {
      if (payload.data.user && typeof payload.data.user === "object") {
        return payload.data.user;
      }

      if (!Array.isArray(payload.data) && !payload.data.accessToken && !payload.data.token) {
        return payload.data;
      }
    }

    return null;
  };

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
        const res = await apiFetch("auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ email, password, role }),
        });

        const userDataCandidate = extractUserFromResponse(res);
        // Ensure role is included in user data
        const userDataWithRole = userDataCandidate ? { ...userDataCandidate, role } : { email, role };
        persistUserProfile(userDataWithRole, {
          email,
          role,
          type,
          authProvider: "password",
          hasPassword: true,
        });
        resetSessionCache(); // ensure subsequent guards refetch session
        if (role) sessionStorage.setItem("role", role);
        sessionStorage.setItem("isAuthenticated", "true");
        if (type) sessionStorage.setItem("userType", type);
        sessionStorage.setItem("authProvider", "password");
        sessionStorage.setItem("hasPassword", "true");
        
        // Wait a bit for cookies to be set by the browser
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Try to validate session, but don't fail if it doesn't work immediately
        // (cookies might take a moment to propagate)
        let sessionValidated = false;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (!sessionValidated && retryCount < maxRetries) {
          try {
            console.log(`🔄 Validating session (attempt ${retryCount + 1}/${maxRetries})...`);
            resetSessionCache(); // Force fresh fetch
            const session = await fetchSession();
            
            if (session?.isAuthenticated) {
              // Verify role matches
              const sessionRole = (session.user?.role || session.role || role || "").toString().toUpperCase();
              const expectedRole = role.toString().toUpperCase();
              
              console.log(`✅ Session validated - Role: ${sessionRole}, Expected: ${expectedRole}`);
              
              if (sessionRole === expectedRole || retryCount === maxRetries - 1) {
                sessionValidated = true;
              } else {
                console.warn(`⚠️ Role mismatch, retrying... (got ${sessionRole}, expected ${expectedRole})`);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms before retry
              }
            } else {
              // If fetchSession failed but we have sessionStorage data, trust it for now
              // The ProtectedRoute will re-validate when it mounts
              const hasStorageData = sessionStorage.getItem("isAuthenticated") === "true" && 
                                    sessionStorage.getItem("role") === role;
              if (hasStorageData && retryCount === maxRetries - 1) {
                console.warn("⚠️ fetchSession failed but sessionStorage indicates auth, proceeding...");
                sessionValidated = true; // Trust sessionStorage as fallback
              } else {
                console.warn(`⚠️ Session not authenticated, retrying... (attempt ${retryCount + 1})`);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms before retry
              }
            }
          } catch (err) {
            console.warn(`⚠️ Session fetch error (attempt ${retryCount + 1}):`, err);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms before retry
            } else {
              // Final attempt failed, but if we have sessionStorage, trust it
              const hasStorageData = sessionStorage.getItem("isAuthenticated") === "true" && 
                                    sessionStorage.getItem("role") === role;
              if (hasStorageData) {
                console.warn("⚠️ fetchSession failed but sessionStorage indicates auth, proceeding...");
                sessionValidated = true; // Trust sessionStorage as fallback
              }
            }
          }
        }
        
        if (!sessionValidated) {
          console.error("❌ Failed to validate session after login, but proceeding with navigation");
        }
        
        toast.success("Logged in successfully!");
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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          toast.error("Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)");
          return;
        }

        setIsLoading(true);

        // Send OTP for email verification
        const res = await apiFetch("auth/send-signup-otp", {
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

      // Small delay to ensure cookies are set and propagated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate after session is established
      const dashboardPath = type === "organizer" 
        ? "/organizer/dashboard-v2" 
        : type === "promoter" 
        ? "/promoter/dashboard" 
        : "/dashboard";
      
      console.log(`🚀 Navigating to dashboard: ${dashboardPath}`);
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoterLogin = () => {
    // Directly redirect to promoter dashboard without showing auth form
    navigate("/promoter/dashboard");
  };

  const handleGoogleLogin = () => {
    // Simple redirect to backend Google OAuth endpoint
    // Backend will handle OAuth and redirect to /dashboard?auth=success
    const googleAuthUrl = buildUrl("api/auth/google");
    window.location.href = googleAuthUrl;
  };

  // Handle OTP verification success
  const handleOtpVerificationSuccess = async (response) => {
    const roleMap = { user: "USER", organizer: "ORGANIZER", promoter: "PROMOTER" };
    const signupType = pendingSignupType; // Store before clearing
    const role = roleMap[signupType] || "USER";
    const verifiedEmail = otpEmail;

    const signupUserData = extractUserFromResponse(response) || {
      email: verifiedEmail,
      role,
    };

    // Ensure role and type are included in user data
    const signupDataWithRole = { ...signupUserData, role, type: signupType };
    persistUserProfile(signupDataWithRole, {
      email: verifiedEmail,
      role,
      type: signupType,
      authProvider: "password",
      hasPassword: true,
    });

    resetSessionCache();
    if (role) sessionStorage.setItem("role", role);
    sessionStorage.setItem("isAuthenticated", "true");
    if (signupType) sessionStorage.setItem("userType", signupType);
    sessionStorage.setItem("authProvider", "password");
    sessionStorage.setItem("hasPassword", "true");

    // Close OTP modal
    setShowOtpModal(false);
    setOtpEmail("");
    setPendingSignupType(null);

    // Wait a bit for cookies to be set by the browser
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Try to validate session
    let sessionValidated = false;
    let retryCount = 0;
    const maxRetries = 2;

    while (!sessionValidated && retryCount < maxRetries) {
      try {
        console.log(`Validating session (attempt ${retryCount + 1}/${maxRetries})...`);
        resetSessionCache();
        const session = await fetchSession();

        if (session?.isAuthenticated) {
          const sessionRole = (session.user?.role || session.role || role || "").toString().toUpperCase();
          const expectedRole = role.toString().toUpperCase();

          console.log(`Session validated - Role: ${sessionRole}, Expected: ${expectedRole}`);

          if (sessionRole === expectedRole || retryCount === maxRetries - 1) {
            sessionValidated = true;
          } else {
            console.warn(`Role mismatch, retrying... (got ${sessionRole}, expected ${expectedRole})`);
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        } else {
          const hasStorageData =
            sessionStorage.getItem("isAuthenticated") === "true" &&
            sessionStorage.getItem("role") === role;
          if (hasStorageData && retryCount === maxRetries - 1) {
            console.warn("fetchSession failed but sessionStorage indicates auth, proceeding...");
            sessionValidated = true;
          } else {
            console.warn(`Session not authenticated, retrying... (attempt ${retryCount + 1})`);
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
      } catch (err) {
        console.warn(`Session fetch error (attempt ${retryCount + 1}):`, err);
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          const hasStorageData =
            sessionStorage.getItem("isAuthenticated") === "true" &&
            sessionStorage.getItem("role") === role;
          if (hasStorageData) {
            console.warn("fetchSession failed but sessionStorage indicates auth, proceeding...");
            sessionValidated = true;
          }
        }
      }
    }

    if (!sessionValidated) {
      console.error("Failed to validate session after signup, but proceeding with navigation");
    }

    toast.success("Account created successfully!");

    // Small delay to ensure cookies are set
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Navigate to dashboard
    const dashboardPath =
      signupType === "organizer"
        ? "/organizer/dashboard-v2"
        : signupType === "promoter"
        ? "/promoter/dashboard"
        : "/dashboard";

    console.log(`Navigating to dashboard: ${dashboardPath}`);
    navigate(dashboardPath, { replace: true });
  };

  // Handle OTP modal close
  const handleOtpModalClose = () => {
    setShowOtpModal(false);
    // Don't clear email so user can retry if they close accidentally
  };

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(0deg_50.21%_19.36%)] to-primary-glow p-4">
        <div className="w-full max-w-4xl">
          <div className="absolute top-4 right-4">
            <Button variant="secondary" size="sm" onClick={handlePromoterLogin} className="gap-2">
              <UserCog className="w-4 h-4" />
              Login as Promoter
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-2">
              Welcome to EventHub
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Choose how you'd like to continue
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer hover:shadow-elegant transition-all hover:-translate-y-1 border-2 hover:border-primary"
              onClick={() => setUserType("user")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">I'm an Attendee</h2>
                <p className="text-muted-foreground mb-4">
                  Discover and book tickets to amazing events
                </p>
                <ul className="text-sm text-left space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Browse thousands of events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Secure ticket booking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Manage your tickets</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-elegant transition-all hover:-translate-y-1 border-2 hover:border-accent"
              onClick={() => setUserType("organizer")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-2">I'm an Organizer</h2>
                <p className="text-muted-foreground mb-4">
                  Create and manage your own events
                </p>
                <ul className="text-sm text-left space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">✓</span>
                    <span>Create unlimited events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">✓</span>
                    <span>Track sales and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">✓</span>
                    <span>Manage your team</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6">
            <Button
              variant="ghost"
              className="text-primary-foreground"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(0deg_50.21%_19.36%)] to-primary-glow p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {userType === "organizer"
              ? "Organizer"
              : userType === "promoter"
              ? "Promoter"
              : "Attendee"}{" "}
            Account
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Welcome back! Sign in to your account"
              : "Create your account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userType === "promoter" ? (
            <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" required />
              </div>
              <Button type="submit" className="w-full" variant="accent" disabled={isLoading}>
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
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Enter your password" required />
                  </div>
                <Button type="submit" className="w-full" variant="accent" disabled={isLoading}>
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
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4"
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

              <TabsContent value="signup">
                <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input id="signup-phone" type="tel" placeholder="Enter your phone number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="Create a password" required />
                  </div>
                <Button type="submit" className="w-full" variant="accent" disabled={isLoading}>
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

          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => setUserType(null)} className="text-sm">
              ← Choose different account type
            </Button>
          </div>
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
  );
};

export default Auth;
