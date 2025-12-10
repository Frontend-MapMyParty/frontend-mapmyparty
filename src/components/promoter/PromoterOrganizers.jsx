 import { useState } from "react";
import { Search, Mail, Ban, Trash2, MoreVertical, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PromoterOrganizers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const organizers = [
    {
      id: "1",
      name: "ABC Events",
      email: "contact@abcevents.com",
      totalEvents: 12,
      activeEvents: 8,
      revenue: 125000,
      status: "active",
      joinedDate: "Jan 2024",
    },
    {
      id: "2",
      name: "TechCorp",
      email: "info@techcorp.com",
      totalEvents: 5,
      activeEvents: 3,
      revenue: 85000,
      status: "active",
      joinedDate: "Feb 2024",
    },
    {
      id: "3",
      name: "Culinary Dreams",
      email: "hello@culinarydreams.com",
      totalEvents: 8,
      activeEvents: 5,
      revenue: 95000,
      status: "active",
      joinedDate: "Mar 2024",
    },
    {
      id: "4",
      name: "Elite Events",
      email: "contact@eliteevents.com",
      totalEvents: 3,
      activeEvents: 1,
      revenue: 45000,
      status: "suspended",
      joinedDate: "Apr 2024",
    },
  ];

  const filteredOrganizers = organizers.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Event Organizers</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredOrganizers.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No organizers found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizers.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {organizer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{organizer.name}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {organizer.email}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {organizer.totalEvents} total
                        </div>
                        <div className="text-muted-foreground">
                          {organizer.activeEvents} active
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      ₹{organizer.revenue.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          organizer.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {organizer.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {organizer.joinedDate}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-yellow-600">
                            <Ban className="w-4 h-4 mr-2" />
                            {organizer.status === "active"
                              ? "Suspend"
                              : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromoterOrganizers;
