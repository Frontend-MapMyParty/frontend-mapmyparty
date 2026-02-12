 import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, Phone, Calendar, MapPin, ChevronRight, Users, Wallet2 } from "lucide-react";

const PromoterUsers = () => {
  const { data, currency, statusBadge } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState("");

  const users = useMemo(() => {
    // Use dummy users from promoter dashboard data; map bookings when available
    const dummyUsers = data.users || [];
    const bookings = Array.isArray(data.bookings) ? data.bookings : [];
    const userMap = {};
    dummyUsers.forEach((u) => {
      userMap[u.email] = {
        id: u.email,
        name: u.name,
        email: u.email,
        phone: "+91 XXXXX XXXXX",
        joinedDate: "Jan 2024",
        city: u.state || "Unknown",
        status: "active",
        totalTickets: u.bookings || 0,
        totalSpent: u.bookings * 850 || 0,
        bookings: [],
      };
    });
    bookings.forEach((booking) => {
      const uid = booking.userId || booking.userEmail;
      if (!userMap[uid]) {
        userMap[uid] = {
          id: uid,
          name: booking.userName || "Unknown",
          email: booking.userEmail,
          phone: booking.userPhone,
          joinedDate: booking.createdAt,
          city: booking.userCity || "Unknown",
          status: booking.userStatus || "active",
          totalTickets: 0,
          totalSpent: 0,
          bookings: [],
        };
      }
      userMap[uid].totalTickets += booking.tickets || 1;
      userMap[uid].totalSpent += booking.amount || booking.totalAmount || 0;
      userMap[uid].bookings.push(booking);
    });
    return Object.values(userMap);
  }, [data.users, data.bookings]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground">All registered users with booking activity and spend.</p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 border-border/70">
          {filteredUsers.length} Users
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="bg-card/70 border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {user.email}
                      <span className="text-muted-foreground/60">•</span>
                      <Phone className="w-3 h-3" />
                      {user.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Tickets</p>
                      <p className="font-semibold">{user.totalTickets}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="font-semibold text-accent">{currency(user.totalSpent)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">City</p>
                      <p className="font-semibold">{user.city}</p>
                    </div>
                  </div>
                  <Link
                    to={`/promoter/users/${user.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition"
                  >
                    View details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromoterUsers;
