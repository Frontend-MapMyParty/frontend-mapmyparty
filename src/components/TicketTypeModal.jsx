 import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Ticket } from "lucide-react";

const TicketTypeModal = ({ open, onClose, ticketType, onSave }) => {
  const [ticketName, setTicketName] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [maxPerCustomer, setMaxPerCustomer] = useState("");
  const [comingSoon, setComingSoon] = useState(false);
  const [onsiteOnly, setOnsiteOnly] = useState(false);
  const [ticketEntryType, setTicketEntryType] = useState("single");
  const [groupQuantity, setGroupQuantity] = useState("");
  const [tableQuantity, setTableQuantity] = useState("");

  const getTitle = () => {
    switch (ticketType) {
      case "vip-guest":
        return (
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Add VIP Guest List</span>
          </div>
        );
      case "standard":
        return (
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <span>Add Standard Ticket</span>
          </div>
        );
      case "table":
        return (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">T</span>
            </div>
            <span>Add Table Ticket</span>
          </div>
        );
      case "group-pass":
        return (
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Add Group Pass</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <span>Add Ticket</span>
          </div>
        );
    }
  };

  const handleSave = () => {
    // Basic validation
    if (!ticketName) {
      alert("Please enter a ticket name");
      return;
    }
    if (ticketType !== "vip-guest" && !price) {
      alert("Please enter a price");
      return;
    }
    if (!quantity) {
      alert("Please enter the total quantity");
      return;
    }

    const data = {
      ticketName,
      ticketCategory,
      price: ticketType === "vip-guest" ? "0" : price,
      quantity,
      description,
      maxPerCustomer: maxPerCustomer || "10", // Default to 10 if not set
      comingSoon,
      onsiteOnly,
      ticketEntryType,
      groupQuantity: groupQuantity || "1",
      tableQuantity: tableQuantity || "1",
      type: ticketType,
    };
    
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{getTitle()}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure the details for this ticket type
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ticketName" className="font-medium">Ticket Name *</Label>
                  <Input
                    id="ticketName"
                    placeholder="e.g., General Admission"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {(ticketType === "vip-guest" || ticketType === "standard") && (
                  <div>
                    <Label htmlFor="ticketCategory" className="font-medium">Ticket Type *</Label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Single Entry</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Couple">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Couple Entry</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {ticketType === "group-pass" && (
                  <div>
                    <Label htmlFor="groupQuantity" className="font-medium">Group Size *</Label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="groupQuantity"
                        type="number"
                        min="1"
                        placeholder="e.g., 4"
                        value={groupQuantity}
                        onChange={(e) => setGroupQuantity(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Number of people included in this group pass</p>
                  </div>
                )}

                {ticketType === "table" && (
                  <div>
                    <Label htmlFor="tableQuantity" className="font-medium">Table Capacity *</Label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="tableQuantity"
                        type="number"
                        min="1"
                        placeholder="e.g., 10"
                        value={tableQuantity}
                        onChange={(e) => setTableQuantity(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Number of seats at each table</p>
                  </div>
                )}

                {ticketType !== "vip-guest" && (
                  <div>
                    <Label htmlFor="price" className="font-medium">Price (₹) *</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        placeholder="499"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="quantity" className="font-medium">Total Tickets Available *</Label>
                  <div className="relative mt-1">
                    <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Maximum number of tickets available for sale</p>
                </div>

                <div>
                  <Label htmlFor="description" className="font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what's included with this ticket..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    This will be shown to attendees when purchasing tickets
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxPerCustomer" className="font-medium">Max Per Customer</Label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="maxPerCustomer"
                        type="number"
                        min="1"
                        placeholder="10"
                        value={maxPerCustomer}
                        onChange={(e) => setMaxPerCustomer(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comingSoon"
                      checked={comingSoon}
                      onCheckedChange={(checked) => setComingSoon(!!checked)}
                      className="h-5 w-5 rounded-md border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                    />
                    <Label htmlFor="comingSoon" className="cursor-pointer text-sm font-medium">
                      Mark as Coming Soon
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onsiteOnly"
                      checked={onsiteOnly}
                      onCheckedChange={(checked) => setOnsiteOnly(!!checked)}
                      className="h-5 w-5 rounded-md border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                    />
                    <Label htmlFor="onsiteOnly" className="cursor-pointer text-sm font-medium">
                      Available at Door Only
                    </Label>
                  </div>
                  </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6 h-10 rounded-lg font-medium"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="px-6 h-10 rounded-lg font-medium bg-primary hover:bg-primary/90 transition-colors text-white"
          >
            Save Ticket
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketTypeModal;
