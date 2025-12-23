import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { fetchSession, resetSessionCache } from "@/utils/auth";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

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

    if (sanitized.name) {
      sessionStorage.setItem("userName", sanitized.name);
    }
    if (sanitized.email) {
      sessionStorage.setItem("userEmail", sanitized.email);
    }
    if (sanitized.phone || sanitized.phoneNumber) {
      sessionStorage.setItem("userPhone", sanitized.phone || sanitized.phoneNumber);
    }
  };

  const extractUserFromResponse = (payload) => {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    // Check for user at top level
    if (payload.user && typeof payload.user === "object") {
      return payload.user;
    }

    // Check for user in data object
    if (payload.data && typeof payload.data === "object") {
      if (payload.data.user && typeof payload.data.user === "object") {
        return payload.data.user;
      }
    }

    return null;
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get("error");
        const success = searchParams.get("success");

        if (error || success === "false") {
          console.error("❌ Google OAuth error:", error);
          toast.error("Google authentication was cancelled or failed");
          navigate("/auth", { replace: true });
          return;
        }
        
        // Backend already handled the OAuth callback and set cookies.
        // Attempt to fetch the current session/user; fall back to URL hints if /auth/me is unavailable.
        let session = null;
        try {
          session = await fetchSession();
        } catch (fetchErr) {
          console.warn("⚠️ Session fetch failed, falling back to URL hints:", fetchErr);
        }

        const isAuthed = session?.isAuthenticated || success === "true";
        const userData = session?.user || {
          email: searchParams.get("email") || "",
          name: searchParams.get("name") || "",
          id: searchParams.get("id") || "",
          role: searchParams.get("role") || "USER",
        };

        if (!isAuthed) {
          toast.error("Authentication failed: session not found");
          navigate("/auth", { replace: true });
          return;
        }

        const role = (userData.role || "USER").toUpperCase();

        const userType =
          role === "ORGANIZER" ? "organizer" :
          role === "PROMOTER" ? "promoter" :
          "user";

        const redirectPath =
          role === "ORGANIZER" ? "/organizer/dashboard-v2" :
          role === "PROMOTER" ? "/promoter/dashboard" :
          "/dashboard";

        persistUserProfile({
          email: userData?.email,
          name: userData?.name,
          id: userData?.id,
          role,
          type: userType,
          authProvider: "google",
          hasPassword: false,
        });

        // cache hint only; actual auth lives in HttpOnly cookies
        sessionStorage.setItem("userType", userType);
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("authProvider", "google");
        sessionStorage.setItem("hasPassword", "false");
        resetSessionCache();

        toast.success("Google authentication successful!");
        window.location.href = redirectPath;
      } catch (err) {
        console.error("❌ Google OAuth callback error:", err);
        toast.error(err?.message || "Google authentication failed");
        navigate("/auth", { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-glow">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-foreground mx-auto mb-4" />
        <p className="text-primary-foreground text-lg">Completing Google sign in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

