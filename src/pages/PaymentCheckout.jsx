import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Gift,
  ScanLine,
  Wallet2,
  Globe,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/config/api";
import { toast } from "sonner";

const paymentMethods = [
  { label: "UPI", icon: Smartphone, accent: "from-emerald-500/80 to-teal-500/60" },
  { label: "Cards", icon: CreditCard, accent: "from-sky-500/80 to-blue-500/60" },
  { label: "Net Banking", icon: Globe, accent: "from-purple-500/80 to-indigo-500/60" },
  { label: "Wallets", icon: Wallet2, accent: "from-amber-500/80 to-orange-500/60" },
  { label: "Gift Voucher", icon: Gift, accent: "from-pink-500/80 to-rose-500/60" },
  { label: "Scan & Pay", icon: ScanLine, accent: "from-red-500/80 to-orange-500/60" },
];

const PaymentCheckout = () => {
  const { organizerSlug, eventSlug } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const summary = state?.eventSummary;
  const tickets = state?.tickets || [];
  const bookingData = state?.bookingData;
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    if (!summary || !tickets.length || !bookingData) {
      navigate(`/events/${organizerSlug}/${eventSlug}`);
    }
  }, [summary, tickets.length, bookingData, organizerSlug, eventSlug, navigate]);

  const handlePayment = async () => {
    if (!bookingData?.bookingId) {
      toast.error("Booking ID not found");
      return;
    }

    setIsProcessing(true);

    try {
      // Process test payment (creates payment + confirms booking)
      const response = await apiFetch("/api/payments/test/process", {
        method: "POST",
        body: JSON.stringify({
          bookingId: bookingData.bookingId,
          paymentMethod: selectedMethod || "TEST",
        }),
      });

      if (response?.success) {
        toast.success("Payment successful!");
        navigate(`/booking-success?bookingId=${bookingData.bookingId}`);
      } else {
        toast.error(response?.errorMessage || "Payment failed");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error?.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const totalsSafe = useMemo(() => {
    const t = bookingData?.totals || {};
    return {
      subtotal: t.ticketSubtotal ?? 0,
      platformFee: t.platformFeeTotal ?? 0,
      gst: t.gst?.gstTotal ?? 0,
      gstType: t.gst?.gstType || "IGST",
      cgst: t.gst?.cgst ?? 0,
      sgst: t.gst?.sgst ?? 0,
      igst: t.gst?.igst ?? 0,
      total: t.grandTotal ?? 0,
    };
  }, [bookingData]);

  const totalQty = useMemo(() => tickets.reduce((s, t) => s + (t.quantity || 0), 0), [tickets]);

  const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

  const itemsForDisplay = useMemo(() => {
    const nameMap = new Map();
    tickets.forEach((t) => nameMap.set(t.id, t.name));
    return (bookingData?.items || []).map((t) => ({
      ...t,
      displayName: t.name || nameMap.get(t.ticketId) || t.ticketId || "Ticket",
      quantity: t.quantity || 0,
      subtotal: t.subtotal ?? 0,
    }));
  }, [bookingData?.items, tickets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0c1120] to-[#05070f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white/80" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5 mr-1" /> Back
          </Button>
          <Badge className="bg-white/10 border-white/20 text-xs">Secure Checkout</Badge>
        </div>

        {summary && (
          <Card className="bg-white/5 border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <CardContent className="p-5 grid md:grid-cols-[1.5fr,1fr] gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-20 rounded-xl overflow-hidden border border-white/10 bg-black/30">
                    <img
                      src={summary.banner}
                      alt={summary.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold leading-snug">{summary.title}</h2>
                    <div className="flex flex-wrap gap-3 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {summary.date || "Date TBA"}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {summary.time || "Time TBA"}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {summary.venue || "Venue TBA"}</span>
                    </div>
                    <p className="text-xs text-white/60">{summary.address}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 text-sm text-white/80">
                <ShieldCheck className="h-5 w-5 text-emerald-300" /> Payments are encrypted & secure
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6">
          <Card className="bg-white/[0.04] border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">Payment options</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              {paymentMethods.map(({ label, icon: Icon, accent }) => (
                <div
                  key={label}
                  onClick={() => setSelectedMethod(label.toUpperCase())}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    selectedMethod === label.toUpperCase()
                      ? "border-[#D60024] bg-[#D60024]/10"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`h-11 w-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-xs text-white/60">
                      {selectedMethod === label.toUpperCase()
                        ? "Selected"
                        : `Continue to pay with ${label}`}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle className="text-lg">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Tickets</span>
                <span className="font-semibold text-white">{totalQty}</span>
              </div>
              <Separator className="bg-white/10" />

              <div className="space-y-2 text-sm">
                {itemsForDisplay.map((t) => (
                  <div key={t.ticketId || t.id} className="flex justify-between items-start gap-3">
                    <div className="text-white/80">
                      <div className="font-semibold text-white">{t.displayName}</div>
                      <div className="text-xs text-white/60">Qty: {t.quantity}</div>
                      {bookingData?.items && (
                        <div className="text-[11px] text-white/50">
                          Platform fee: {formatCurrency(t.platformFee || 0)} • GST: {formatCurrency(t.gstAmount || 0)}
                        </div>
                      )}
                    </div>
                    <div className="text-white font-semibold">
                      {formatCurrency(t.subtotal || 0)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-2 text-sm text-white/80">
                <div className="flex justify-between"><span>Ticket subtotal</span><span className="text-white">{formatCurrency(totalsSafe.subtotal || 0)}</span></div>
                <div className="flex justify-between"><span>Platform fee</span><span className="text-white">{formatCurrency(totalsSafe.platformFee || 0)}</span></div>
                <div className="flex justify-between">
                  <span>
                    GST {totalsSafe.gstType ? `(${totalsSafe.gstType.replace(/_/g, " + ")})` : ""}
                  </span>
                  <span className="text-white">{formatCurrency(totalsSafe.gst || 0)}</span>
                </div>
                {totalsSafe.gstType === "CGST_SGST" && (
                  <div className="text-[11px] text-white/60 flex justify-end gap-3">
                    <span>CGST: {formatCurrency(totalsSafe.cgst || 0)}</span>
                    <span>SGST: {formatCurrency(totalsSafe.sgst || 0)}</span>
                  </div>
                )}
                {totalsSafe.gstType === "IGST" && (
                  <div className="text-[11px] text-white/60 flex justify-end">
                    <span>IGST: {formatCurrency(totalsSafe.igst || 0)}</span>
                  </div>
                )}
              </div>

              <Separator className="bg-white/10" />

              <div className="flex justify-between items-center text-base font-semibold">
                <span>Total Amount</span>
                <span className="text-[#D60024]">{formatCurrency(totalsSafe.total || 0)}</span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || !selectedMethod}
                className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : !selectedMethod ? (
                  "Select a payment method"
                ) : (
                  "Pay & Confirm"
                )}
              </Button>
              <p className="text-xs text-center text-white/60">
                {isProcessing
                  ? "Please wait while we process your payment..."
                  : "You'll receive instant confirmation after payment."}
              </p>
              <p className="text-xs text-center text-amber-300/80 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 mt-2">
                ⚠️ Test Mode: This is a simulated payment for testing purposes.
                No actual charges will be made.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;
