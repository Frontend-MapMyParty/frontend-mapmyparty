 import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Calendar, Trash2, CheckCircle, TrendingUp, Users, DollarSign, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
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
import eventMusic from "@/assets/event-music.jpg";
import eventConference from "@/assets/event-conference.jpg";
import eventFood from "@/assets/event-food.jpg";
import { useEvents } from "@/hooks/useEvents";
import EventDetailModal from "./EventDetailModal";
import { toast } from "sonner";

const PromoterEvents = () => {
  const navigate = useNavigate();
  const { events, deleteEvent } = useEvents();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  const allOrganizerEvents = [
    {
      id: "1",
      title: "Summer Music Festival 2024",
      organizer: "ABC Events",
      date: "July 15, 2024",
      status: "published",
      category: "Music",
      ticketsSold: 4850,
      totalTickets: 5000,
      revenue: 28500,
      image: eventMusic,
      promoted: true,
    },
    {
      id: "2",
      title: "Tech Innovation Conference",
      organizer: "TechCorp",
      date: "August 22, 2024",
      status: "published",
      category: "Conference",
      ticketsSold: 1850,
      totalTickets: 2000,
      revenue: 19960,
      image: eventConference,
      promoted: false,
    },
    {
      id: "3",
      title: "Food & Wine Festival",
      organizer: "Culinary Dreams",
      date: "September 10, 2024",
      status: "published",
      category: "Food",
      ticketsSold: 3200,
      totalTickets: 4000,
      revenue: 45000,
      image: eventFood,
      promoted: true,
    },
    {
      id: "4",
      title: "Winter Gala Night",
      organizer: "Elite Events",
      date: "December 10, 2024",
      status: "draft",
      category: "Arts",
      ticketsSold: 0,
      totalTickets: 500,
      revenue: 0,
      image: eventMusic,
      promoted: false,
    },
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      organizer: "EventHub Organizer",
      date: e.date,
      status: e.status,
      category: e.category,
      ticketsSold: 0,
      totalTickets: 0,
      revenue: 0,
      image: e.image,
      promoted: false,
    })),
  ];

  const filteredEvents = useMemo(() => {
    return allOrganizerEvents.filter((event) => {
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || event.category === categoryFilter;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [allOrganizerEvents, statusFilter, categoryFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    } else if (totalPages > 0 && currentPage < 1) {
      setCurrentPage(1);
    }
  }, [statusFilter, categoryFilter, searchQuery, totalPages, currentPage]);

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleVerifyEvent = (eventId, eventTitle) => {
    toast.success(`Event "${eventTitle}" has been verified!`);
  };

  const handleDeleteEvent = (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      deleteEvent(eventId);
      toast.success(`Event "${eventTitle}" has been deleted`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-white dark:bg-neutral-900/30 border-b-2 border-border/50 px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <CardTitle className="text-2xl font-bold text-red-600 mb-1">
              All Events
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage and track all your events
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search events or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-10 rounded-lg border-2 focus:border-red-600 transition-colors"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-lg border-2">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-lg border-2">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <Calendar className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">No events found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedEvents.map((event, index) => {
              const capacityPercentage = event.totalTickets > 0
                ? Math.round((event.ticketsSold / event.totalTickets) * 100)
                : 0;
              
              const getStatusColor = (status) => {
                if (status === "published") return "from-red-600 to-red-500";
                return "from-gray-600 to-gray-800";
              };

              const getCategoryColor = () => "from-black to-neutral-700";

              return (
                <Card
                  key={event.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-red-200 dark:hover:border-red-800 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="md:flex">
                    {/* Image Section */}
                    <div className="md:w-64 h-48 md:h-auto relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Status Badge on Image */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge
                          className={`bg-gradient-to-r ${getStatusColor(event.status)} text-white border-0 shadow-lg font-semibold`}
                        >
                          {event.status === "published" ? "✓ Published" : "Draft"}
                        </Badge>
                        <Badge
                          className={`bg-gradient-to-r ${getCategoryColor(event.category)} text-white border-0 shadow-lg font-semibold`}
                        >
                          {event.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Users className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-foreground">{event.organizer}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 text-black" />
                              <span>{event.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {/* Tickets Sold */}
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-900/30 border border-gray-200/50 dark:border-neutral-800/50 hover:shadow-lg transition-all duration-300 group/stat">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-black text-white">
                              <Users className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Tickets Sold
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {event.ticketsSold.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            of {event.totalTickets.toLocaleString()} total
                          </p>
                        </div>

                        {/* Revenue */}
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-900/30 border border-gray-200/50 dark:border-neutral-800/50 hover:shadow-lg transition-all duration-300 group/stat">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-red-600 text-white">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Revenue
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-red-600">
                            ₹{event.revenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total earnings
                          </p>
                        </div>

                        {/* Capacity */}
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-900/30 border border-gray-200/50 dark:border-neutral-800/50 hover:shadow-lg transition-all duration-300 group/stat">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-black text-white">
                              <BarChart3 className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Capacity
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-black dark:text-white">
                            {capacityPercentage}%
                          </p>
                          <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-red-600 transition-all duration-500"
                              style={{ width: `${capacityPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          className="bg-black hover:bg-neutral-900 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                          onClick={() => navigate(`/promoter/event/${event.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          View Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-neutral-900/30 dark:hover:border-neutral-700 transition-all duration-300 hover:scale-105"
                          onClick={() => handleViewDetail(event)}
                        >
                          <TrendingUp className="w-4 h-4 mr-1.5" />
                          Analytics
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-neutral-900/30 dark:hover:border-neutral-700 transition-all duration-300 hover:scale-105"
                          onClick={() => handleVerifyEvent(event.id, event.title)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:border-red-700 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-105"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-2 hover:bg-accent/50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? "bg-red-600 hover:bg-red-700 text-white border-0"
                                : "border-2 hover:bg-accent/50"
                            }
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-2 hover:bg-accent/50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {selectedEvent && (
        <EventDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          event={selectedEvent}
        />
      )}
    </Card>
  );
};

export default PromoterEvents;
