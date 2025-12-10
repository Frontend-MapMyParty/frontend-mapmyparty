 import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, Phone, Calendar, MapPin } from "lucide-react";

const PromoterUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const users = [
    {
      id: "1",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      phone: "+91 98765 43210",
      totalTickets: 12,
      totalSpent: 8400,
      joinedDate: "Jan 2024",
      city: "Mumbai",
      status: "active",
    },
    {
      id: "2",
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 98765 43211",
      totalTickets: 8,
      totalSpent: 5600,
      joinedDate: "Feb 2024",
      city: "Delhi",
      status: "active",
    },
    {
      id: "3",
      name: "Amit Patel",
      email: "amit.patel@email.com",
      phone: "+91 98765 43212",
      totalTickets: 15,
      totalSpent: 12800,
      joinedDate: "Dec 2023",
      city: "Bangalore",
      status: "active",
    },
    {
      id: "4",
      name: "Sneha Reddy",
      email: "sneha.reddy@email.com",
      phone: "+91 98765 43213",
      totalTickets: 6,
      totalSpent: 4200,
      joinedDate: "Mar 2024",
      city: "Hyderabad",
      status: "active",
    },
    {
      id: "5",
      name: "Vikram Singh",
      email: "vikram.singh@email.com",
      phone: "+91 98765 43214",
      totalTickets: 10,
      totalSpent: 7500,
      joinedDate: "Jan 2024",
      city: "Pune",
      status: "active",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.city.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>All Users</CardTitle>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-elegant transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {user.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-xl font-bold text-primary">
                          ₹{user.totalSpent.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{user.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {user.joinedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Tickets Purchased</p>
                        <p className="text-lg font-semibold">{user.totalTickets}</p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <p className="text-xs text-muted-foreground">Average per Ticket</p>
                        <p className="text-lg font-semibold">
                          ₹{Math.round(user.totalSpent / user.totalTickets)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoterUsers;
