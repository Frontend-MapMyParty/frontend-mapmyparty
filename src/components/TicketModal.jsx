import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Ticket,
  User,
  Download,
  Share2,
  Clock,
  Hash,
  Copy,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

const TicketModal = ({ isOpen, onClose, ticket }) => {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (ticket && isOpen) {
      const qrData = JSON.stringify({
        orderId: ticket.orderId,
        eventTitle: ticket.eventTitle,
        eventDate: ticket.eventDate,
        bookingId: ticket.id,
      });
      QRCode.toDataURL(qrData, { width: 200, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error(err));
    }
  }, [ticket, isOpen]);

  const handleDownload = () => {
    toast.success("Ticket downloaded!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ticket.eventTitle,
          text: `My ticket for ${ticket.eventTitle}`,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.info("Unable to share");
        }
      }
    } else {
      toast.info("Share not supported on this device");
    }
  };

  const handleViewAllTickets = () => {
    if (ticket?.id) {
      navigate(`/dashboard/bookings/${ticket.id}/tickets`);
      onClose();
    }
  };

  const copyOrderId = () => {
    if (ticket?.orderId) {
      navigator.clipboard.writeText(ticket.orderId);
      toast.success("Order ID copied!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    const d = new Date(dateString);
    if (isNaN(d)) return "Date TBA";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!ticket) return null;

  const isConfirmed = ticket.status === "confirmed";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-2 border-[rgba(100,200,255,0.2)] text-white p-0 rounded-2xl">
        <div className="relative">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-br from-[#D60024] via-[#b8001f] to-[#8b0017] p-6 rounded-t-2xl">
            {/* Decorative Elements */}
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-white/30" />
            <Sparkles className="absolute bottom-6 right-8 w-4 h-4 text-white/20" />

            {/* Status Badge */}
            <Badge
              className={`${
                isConfirmed
                  ? "bg-emerald-500/80 text-white"
                  : "bg-amber-500/80 text-white"
              } text-[10px] px-2 py-0.5 mb-3`}
            >
              {isConfirmed && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {isConfirmed ? "Confirmed" : "Pending"}
            </Badge>

            {/* Event Title */}
            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
              {ticket.eventTitle}
            </h3>

            {/* Ticket Type */}
            <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1">
              <Ticket className="w-3 h-3 mr-1.5" />
              {ticket.ticketType || "Standard Ticket"} x{ticket.quantity || 1}
            </Badge>

            {/* Wavy separator */}
            <div className="absolute -bottom-3 left-0 right-0 h-6 overflow-hidden">
              <svg
                viewBox="0 0 400 24"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,12 Q25,0 50,12 T100,12 T150,12 T200,12 T250,12 T300,12 T350,12 T400,12 L400,24 L0,24 Z"
                  fill="#0a0a0a"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* QR Code Section */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-lg flex-shrink-0">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                    <QrCode className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">
                    Order ID
                  </p>
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded px-2 py-1 -mx-2 transition-colors"
                    onClick={copyOrderId}
                  >
                    <Hash className="w-3.5 h-3.5 text-[#D60024]" />
                    <span className="font-mono text-white text-sm">
                      {ticket.orderId?.slice(0, 12) || ticket.id?.slice(0, 12)}
                    </span>
                    <Copy className="w-3.5 h-3.5 text-white/40" />
                  </div>
                </div>
                <p className="text-white/40 text-[10px] leading-relaxed">
                  Show this QR code at the venue entrance for quick check-in
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-1">
              <div className="border-t-2 border-dashed border-white/15"></div>
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#040712] rounded-full"></div>
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#040712] rounded-full"></div>
            </div>

            {/* Event Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D60024]/20 to-[#D60024]/5 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-[#D60024]" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {formatDate(ticket.eventDate)}
                  </p>
                  <p className="text-white/50 text-xs">Event Date</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#60a5fa]/20 to-[#60a5fa]/5 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#60a5fa]" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {ticket.eventTime || "Time TBA"}
                  </p>
                  <p className="text-white/50 text-xs">Doors Open</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm line-clamp-1">
                    {ticket.location || "Venue TBA"}
                  </p>
                  <p className="text-white/50 text-xs">Location</p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-[rgba(214,0,36,0.15)] to-[rgba(214,0,36,0.05)] rounded-xl p-4 border border-[rgba(214,0,36,0.2)]">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">Total Paid</span>
                <span className="text-2xl font-bold text-[#D60024]">
                  ₹{ticket.totalPrice?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all"
                onClick={handleViewAllTickets}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View All Tickets
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-center text-white/40 pt-2">
              Please show this ticket at the venue entrance
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;
