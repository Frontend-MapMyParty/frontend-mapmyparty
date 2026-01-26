import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Loader2, Mail, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/config/api";

const OTPVerificationModal = ({
  isOpen,
  onClose,
  email,
  onVerificationSuccess,
  expiryMinutes = 10,
}) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiryTime, setExpiryTime] = useState(expiryMinutes * 60);
  const [error, setError] = useState("");

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!isOpen) {
      setExpiryTime(expiryMinutes * 60);
      setOtp("");
      setError("");
      return;
    }

    const timer = setInterval(() => {
      setExpiryTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, expiryMinutes]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await apiFetch("auth/verify-signup-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      toast.success("Email verified successfully!");
      onVerificationSuccess(response);
    } catch (err) {
      const errorMessage = err?.message || "Verification failed. Please try again.";
      setError(errorMessage);
      setOtp("");

      // Show specific error for expired/too many attempts
      if (errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("too many")) {
        toast.error(errorMessage);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [otp, email, onVerificationSuccess]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError("");

    try {
      const response = await apiFetch("auth/resend-signup-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      toast.success("New verification code sent!");
      setResendCooldown(60);
      setExpiryTime(expiryMinutes * 60);
      setOtp("");
    } catch (err) {
      const errorMessage = err?.message || "Failed to resend code. Please try again.";

      // Check if it's a rate limit error
      if (errorMessage.includes("wait")) {
        const waitMatch = errorMessage.match(/(\d+)/);
        if (waitMatch) {
          setResendCooldown(parseInt(waitMatch[1]));
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    if (!isVerifying) {
      onClose();
    }
  };

  const isExpired = expiryTime <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Verify Your Email</DialogTitle>
          <DialogDescription className="text-base">
            We've sent a 6-digit verification code to
            <span className="block font-semibold text-foreground mt-1">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* OTP Input */}
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError("");
              }}
              disabled={isVerifying || isExpired}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold" />
                <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold" />
                <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold" />
                <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold" />
                <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold" />
              </InputOTPGroup>
            </InputOTP>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Expiry Timer */}
            <div className={`text-sm ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
              {isExpired ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Code expired. Please request a new one.
                </span>
              ) : (
                <span>
                  Code expires in <span className="font-semibold">{formatTime(expiryTime)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || isVerifying || isExpired}
              className="w-full h-12 text-base font-semibold"
              variant="accent"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Verify Email
                </>
              )}
            </Button>

            <div className="flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Didn't receive the code?</span>
              <Button
                variant="link"
                size="sm"
                onClick={handleResend}
                disabled={isResending || (resendCooldown > 0 && !isExpired)}
                className="text-primary font-semibold"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 && !isExpired ? (
                  <>
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Security note */}
          <p className="text-xs text-center text-muted-foreground">
            For security, never share this code with anyone.
            <br />
            Map MyParty will never ask for your code.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;
