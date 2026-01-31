import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Download,
  Share2,
  CheckCircle2,
  Copy,
  QrCode,
  Ticket,
  Hash,
  Sparkles,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { apiFetch, buildUrl } from "@/config/api";

const TicketCard = ({ ticket, event, booking, user, index = 0, onDownload }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (ticket?.qrCode) {
      const qrData = JSON.stringify({
        token: ticket.qrCode,
        bookingId: booking?.id,
        ticketId: ticket.id,
      });
      QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR generation error:", err));
    }
  }, [ticket, booking]);

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

  const formatTime = (dateString) => {
    if (!dateString) return "Time TBA";
    const d = new Date(dateString);
    if (isNaN(d)) return "Time TBA";
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const copyManualCode = () => {
    if (ticket?.manualCheckInCode) {
      navigator.clipboard.writeText(ticket.manualCheckInCode.toUpperCase());
      toast.success("Manual code copied to clipboard!");
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      if (onDownload) {
        await onDownload(ticket);
      }
      toast.success("Ticket downloaded!");
    } catch (error) {
      toast.error("Failed to download ticket");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${event?.name}`,
          text: `My ticket for ${event?.name} on ${formatDate(event?.startDate)}`,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Unable to share");
        }
      }
    } else {
      toast.info("Share not supported on this device");
    }
  };

  const getStatusColor = () => {
    if (ticket?.checkedIn) return "bg-emerald-500";
    if (booking?.status === "CONFIRMED") return "bg-blue-500";
    if (booking?.status === "PENDING") return "bg-amber-500";
    return "bg-gray-500";
  };

  const getStatusText = () => {
    if (ticket?.checkedIn) return "Checked In";
    if (booking?.status === "CONFIRMED") return "Valid";
    if (booking?.status === "PENDING") return "Pending";
    return booking?.status || "Unknown";
  };

  const venueName = event?.venue?.name || event?.venue?.city || "Venue TBA";
  const venueLocation = event?.venue
    ? [event.venue.city, event.venue.state].filter(Boolean).join(", ")
    : "Location TBA";

  return (
    <div
      className="group relative w-full max-w-md mx-auto perspective-1000"
      style={{ perspective: "1000px" }}
    >
      {/* Ticket Container with 3D flip effect */}
      <div
        className={`relative transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Ticket */}
        <div
          className="relative backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Main Ticket Body */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Decorative holes on left side */}
            <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around py-6 z-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-[#040712] rounded-full -ml-2"
                />
              ))}
            </div>

            {/* Ticket Content */}
            <div className="ml-2">
              {/* Top Section - Event Header */}
              <div className="relative bg-gradient-to-br from-[#D60024] via-[#b8001f] to-[#8b0017] p-5 pb-6">
                {/* Sparkle decorations */}
                <Sparkles className="absolute top-3 right-3 w-5 h-5 text-white/30" />
                <Sparkles className="absolute bottom-4 right-8 w-4 h-4 text-white/20" />

                {/* Status Badge */}
                <div className="absolute top-3 left-6">
                  <Badge
                    className={`${getStatusColor()} text-white text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wider`}
                  >
                    {getStatusText()}
                  </Badge>
                </div>

                {/* Ticket Number */}
                <div className="absolute top-3 right-10 text-white/60 text-xs font-mono">
                  #{String(index + 1).padStart(3, "0")}
                </div>

                {/* Event Name */}
                <div className="mt-6 mb-2">
                  <h3 className="text-white font-bold text-xl leading-tight line-clamp-2 pr-4">
                    {event?.name || "Event Name"}
                  </h3>
                </div>

                {/* Ticket Type Badge */}
                <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1">
                  <Ticket className="w-3 h-3 mr-1.5" />
                  {ticket?.name || "Standard Ticket"}
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

              {/* Middle Section - Event Details */}
              <div className="bg-[#0a0a0a] px-5 py-5 space-y-4">
                {/* Date & Time Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D60024]/20 to-[#D60024]/5 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#D60024]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {formatDate(event?.startDate)}
                      </p>
                      <p className="text-white/60 text-xs">Event Date</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#60a5fa]/20 to-[#60a5fa]/5 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#60a5fa]" />
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold text-sm">
                        {formatTime(event?.startDate)}
                      </p>
                      <p className="text-white/60 text-xs">Doors Open</p>
                    </div>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm line-clamp-1">
                      {venueName}
                    </p>
                    <p className="text-white/60 text-xs line-clamp-1">
                      {venueLocation}
                    </p>
                  </div>
                </div>

                {/* Attendee */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7]/20 to-[#a855f7]/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#a855f7]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">
                      {user?.name || "Guest"}
                    </p>
                    <p className="text-white/60 text-xs">
                      {ticket?.quantity || 1}{" "}
                      {(ticket?.quantity || 1) > 1 ? "persons" : "person"}
                    </p>
                  </div>
                </div>

                {/* Dashed separator */}
                <div className="relative py-2">
                  <div className="border-t-2 border-dashed border-white/20"></div>
                  <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#040712] rounded-full"></div>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#040712] rounded-full"></div>
                </div>

                {/* QR Code Section */}
                <div className="flex items-center gap-4">
                  {/* QR Code */}
                  <div className="relative">
                    <div className="bg-white p-2 rounded-xl shadow-lg">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-24 h-24"
                        />
                      ) : (
                        <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                          <QrCode className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {ticket?.checkedIn && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Manual Code & Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">
                        Manual Check-in Code
                      </p>
                      <div
                        className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyManualCode();
                        }}
                      >
                        <Hash className="w-4 h-4 text-[#D60024]" />
                        <span className="font-mono font-bold text-white tracking-widest text-sm">
                          {ticket?.manualCheckInCode?.toUpperCase() || "N/A"}
                        </span>
                        <Copy className="w-4 h-4 text-white/40 ml-auto" />
                      </div>
                    </div>

                    <p className="text-white/40 text-[10px] leading-relaxed">
                      Show this QR code at the venue entrance or provide the
                      manual code for check-in
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Actions */}
              <div className="bg-gradient-to-r from-[#0f1117] to-[#131620] px-5 py-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    disabled={isDownloading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? "..." : "Download"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Tap hint */}
                <p className="text-center text-white/30 text-[10px] mt-3">
                  Tap to flip and see more details
                </p>
              </div>
            </div>

            {/* Decorative holes on right side */}
            <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col justify-around py-6 z-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-[#040712] rounded-full -mr-2 ml-auto"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Back of Ticket */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl h-full">
            {/* Decorative holes on left side */}
            <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around py-6 z-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-[#040712] rounded-full -ml-2"
                />
              ))}
            </div>

            <div className="ml-2 h-full bg-gradient-to-br from-[#0f1117] to-[#0a0a0a]">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#D60024]/20 to-transparent p-5 border-b border-white/10">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#D60024]" />
                  Ticket Details
                </h4>
              </div>

              {/* Details Grid */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      Booking ID
                    </p>
                    <p className="text-white font-mono text-xs">
                      {booking?.id?.slice(0, 8) || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      Ticket ID
                    </p>
                    <p className="text-white font-mono text-xs">
                      {ticket?.id?.slice(0, 8) || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      Ticket Type
                    </p>
                    <p className="text-white font-semibold text-sm">
                      {ticket?.name || "Standard"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      Quantity
                    </p>
                    <p className="text-white font-semibold text-sm">
                      {ticket?.quantity || 1}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      Price per Ticket
                    </p>
                    <p className="text-white font-semibold text-sm">
                      {ticket?.ticketPrice
                        ? `₹${ticket.ticketPrice.toLocaleString()}`
                        : "Free"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      Subtotal
                    </p>
                    <p className="text-[#D60024] font-bold text-sm">
                      {ticket?.subtotal
                        ? `₹${ticket.subtotal.toLocaleString()}`
                        : "Free"}
                    </p>
                  </div>
                </div>

                {/* Organizer */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">
                    Organized By
                  </p>
                  <p className="text-white font-medium">
                    {event?.organizer || "Event Organizer"}
                  </p>
                </div>

                {/* Check-in Status */}
                {ticket?.checkedIn && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <div>
                        <p className="font-semibold text-sm">Checked In</p>
                        <p className="text-emerald-400/60 text-xs">
                          {ticket.checkedInAt
                            ? new Date(ticket.checkedInAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/30 text-[10px] leading-relaxed">
                    This ticket is non-transferable and must be presented at the
                    venue entrance. The organizer reserves the right to refuse
                    entry. Please arrive on time.
                  </p>
                </div>
              </div>

              {/* Back button hint */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/30 text-[10px]">Tap to flip back</p>
              </div>
            </div>

            {/* Decorative holes on right side */}
            <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col justify-around py-6 z-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-[#040712] rounded-full -mr-2 ml-auto"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
