 import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, User, Download, Share2 } from "lucide-react";

const TicketModal = ({ isOpen, onClose, ticket }) => {
  const handleDownload = () => {
    alert("Ticket downloaded! (This is a demo)");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ticket.eventTitle,
        text: `My ticket for ${ticket.eventTitle}`,
      });
    } else {
      alert("Share functionality not supported on this device");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Your Ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 animate-fade-in">
          {/* Ticket Card */}
          <Card className="overflow-hidden border-2 border-primary/20">
            <div className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  E-Ticket
                </Badge>
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{ticket.eventTitle}</h3>
              <p className="text-sm text-primary-foreground/90">{ticket.ticketType}</p>
            </div>

            <div className="p-6 space-y-4 bg-gradient-to-b from-background to-muted/30">
              {/* QR Code Placeholder */}
              <div className="bg-white rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-border">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded flex items-center justify-center">
                  <div className="text-center">
                    <Ticket className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">QR Code</p>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-muted-foreground">
                      {ticket.eventDate} at {ticket.eventTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{ticket.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Quantity</p>
                    <p className="text-muted-foreground">
                      {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ticket className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Ticket ID</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {ticket.id.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="font-semibold">Total Paid</span>
                <span className="text-2xl font-bold text-primary">₹{ticket.totalPrice}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Please show this ticket at the venue entrance
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;
