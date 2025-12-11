 import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  MoreVertical,
  BarChart3,
  UserPlus,
  Mail,
  Settings,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import eventMusic from "@/assets/event-music.jpg";
import eventConference from "@/assets/event-conference.jpg";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { toast } from "sonner";

const OrganizerDashboard = () => {
  const navigate = useNavigate();

  // Note: Authentication is handled by ProtectedRoute wrapper
  // No need for redundant auth check here
  
  // Use the new hook to fetch events from API
  const {
    events,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    clearFilters,
    refresh,
    statistics,
  } = useOrganizerEvents();

  const [searchQuery, setSearchQuery] = useState("");
  const [analyticsFilter, setAnalyticsFilter] = useState("all");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("manager");

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat('en-IN').format(amount || 0)}`;
  };

  const stats = [
    {
      title: "Total Events",
      value: formatNumber(statistics.totalEvents),
      change: `${statistics.publishedEvents} published, ${statistics.draftEvents} drafts`,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Total Attendees",
      value: formatNumber(statistics.totalAttendees),
      change: "Across all events",
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Revenue",
      value: formatCurrency(statistics.totalRevenue),
      change: "Total earnings",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Ticket Sales",
      value: formatNumber(statistics.totalTicketsSold),
      change: "Tickets sold",
      icon: TrendingUp,
      color: "text-blue-600",
    },
  ];

  const teamMembers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Manager",
      status: "active",
      eventsManaged: 5,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Coordinator",
      status: "active",
      eventsManaged: 3,
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Manager",
      status: "pending",
      eventsManaged: 0,
    },
  ];

  // Handle search with debounce
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.length >= 2 || value.length === 0) {
      updateFilters({ search: value || null });
    }
  };

  // Handle filter changes
  const handleStatusFilter = (value) => {
    const status = value === "all" ? null : value.toUpperCase();
    updateFilters({ status2: status });
  };

  const handleCategoryFilter = (value) => {
    const category = value === "all" ? null : value.toUpperCase();
    updateFilters({ category });
  };

  // Handle analytics filter for event cards display
  const analyticsFilteredEvents = useMemo(() => {
    if (analyticsFilter === "all") return events;
    const filterStatus = analyticsFilter.toUpperCase();
    return events.filter((e) => {
      const eventStatus = ((e.status2 || e.status) || "").toUpperCase();
      return eventStatus === filterStatus;
    });
  }, [events, analyticsFilter]);

  // Get status badge variant
  const getStatusBadge = (event) => {
    const status = event.status2 || event.status || "";
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case "PUBLISHED":
        return <Badge className="bg-green-500">Published</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get fallback image
  const getEventImage = (event) => {
    if (event.flyerImage) return event.flyerImage;
    if (event.image) return event.image;
    if (event.flyerImageUrl) return event.flyerImageUrl;
    // Default fallback based on category
    const category = (event.mainCategory || event.category || "").toLowerCase();
    if (category.includes("music")) return eventMusic;
    if (category.includes("conference") || category.includes("workshop")) return eventConference;
    return eventMusic;
  };

  // Get event title (handle both API formats)
  const getEventTitle = (event) => {
    return event.title || event.eventTitle || "Untitled Event";
  };

  // Get event location
  const getEventLocation = (event) => {
    if (event.venues && event.venues.length > 0) {
      const venue = event.venues[0];
      return `${venue.city || ""}${venue.city && venue.state ? ", " : ""}${venue.state || ""}`.trim() || "Location TBA";
    }
    return event.location || event.venue || "Location TBA";
  };

  const handleInviteMember = () => {
    if (!newMemberEmail) {
      toast.error("Please enter an email address");
      return;
    }
    toast.success(`Invitation sent to ${newMemberEmail}`);
    setNewMemberEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated userRole="organizer" />

      <main className="flex-1 py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Organizer Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Manage your events and track performance
              </p>
            </div>
            <Link to="/organizer/select-event-type">
              <Button variant="accent" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mb-2">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Team
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events by title..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select
                      value={filters.status2 || "all"}
                      onValueChange={handleStatusFilter}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.category || "all"}
                      onValueChange={handleCategoryFilter}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => {
                        clearFilters();
                        setSearchQuery("");
                      }}
                    >
                      Clear Filters
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={refresh}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Events List */}
              {error && (
                <Card className={error.includes("pending backend") ? "border-yellow-500 bg-yellow-50" : "border-destructive"}>
                  <CardContent className="p-6">
                    <p className={error.includes("pending backend") ? "text-yellow-800" : "text-destructive"}>
                      {error.includes("pending backend") ? (
                        <>
                          <span className="font-semibold">⚠️ Development Mode:</span> {error}
                        </>
                      ) : (
                        <>Error loading events: {error}</>
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}

              {loading && !events.length ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading your events...</p>
                  </CardContent>
                </Card>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground mb-6">
                      {filters.search || filters.status2 || filters.category
                        ? "Try adjusting your filters"
                        : "Get started by creating your first event"}
                    </p>
                    <Link to="/organizer/select-event-type">
                      <Button variant="accent">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {events.length} of {pagination.totalEvents} events
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {events.map((event) => (
                      <Card key={event.id || event.eventId}>
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <img
                              src={getEventImage(event)}
                              alt={getEventTitle(event)}
                              className="w-48 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = eventMusic;
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold mb-2">
                                    {getEventTitle(event)}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {getStatusBadge(event)}
                                    {(event.category || event.mainCategory) && (
                                      <Badge variant="outline">
                                        {event.category || event.mainCategory}
                                      </Badge>
                                    )}
                                    {(event.subCategory || event.subcategory) && (
                                      <Badge variant="outline">
                                        {event.subCategory || event.subcategory}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link to={`/events/${event.id || event.eventId}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/organizer/edit-event/${event.id || event.eventId}`)
                                      }
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Event
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Event
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Date</p>
                                  <p className="font-medium">
                                    {formatDate(event.startDate || event.date)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Tickets Sold</p>
                                  <p className="font-medium">
                                    {formatNumber(event.stats?.totalTicketsSold || event.ticketsSold || 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Revenue</p>
                                  <p className="font-medium">
                                    {formatCurrency(event.stats?.totalRevenue || event.revenue || 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Bookings</p>
                                  <p className="font-medium">
                                    {formatNumber(event.stats?.confirmedBookings || event._count?.bookings || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => updateFilters({ page: pagination.page - 1 })}
                        disabled={pagination.page <= 1 || loading}
                      >
                        Previous
                      </Button>
                      <Button variant="outline" disabled>
                        Page {pagination.page} of {pagination.totalPages}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateFilters({ page: pagination.page + 1 })}
                        disabled={pagination.page >= pagination.totalPages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Event Analytics</span>
                    <Select
                      value={analyticsFilter}
                      onValueChange={setAnalyticsFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Drafts</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsFilteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No events to analyze
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analyticsFilteredEvents.map((event) => (
                        <div
                          key={event.id || event.eventId}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">
                              {getEventTitle(event)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(event.startDate || event.date)}
                            </p>
                          </div>
                          <div className="flex gap-6 text-right">
                            <div>
                              <p className="text-2xl font-bold">
                                {formatNumber(event.stats?.totalTicketsSold || event.ticketsSold || 0)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Tickets
                              </p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold">
                                {formatCurrency(event.stats?.totalRevenue || event.revenue || 0)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Revenue
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invite Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={newMemberRole}
                      onValueChange={setNewMemberRole}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="coordinator">Coordinator</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleInviteMember}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.role}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {member.eventsManaged} events managed
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrganizerDashboard;

