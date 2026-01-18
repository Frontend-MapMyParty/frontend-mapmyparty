import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Calendar,
  MapPin,
  Search,
  TrendingUp,
  Star,
  Users,
  Ticket,
  SlidersHorizontal,
  Sparkles,
  Briefcase,
  Music,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import Header from "@/components/Header";
import { isAuthenticated as checkAuth } from "@/utils/auth";

const CATEGORY_CONFIG = [
  {
    id: "WORKSHOP",
    label: "Workshop",
    icon: Briefcase,
    gradient: "from-[#ff8a05] via-[#ff4d67] to-[#ff2257]",
    accent: "border-[#ff8a05]/40",
  },
  {
    id: "MUSIC",
    label: "Music",
    icon: Music,
    gradient: "from-[#2563eb] via-[#7c3aed] to-[#a855f7]",
    accent: "border-[#7c9dff]/40",
  },
];

const WORKSHOP_SUBCATEGORIES = [
  "Sports",
  "Arts",
  "Meeting",
  "Conference",
  "Seminar",
  "Yoga",
  "Cooking",
  "Dance",
  "Self Help",
  "Consultation",
  "Corporate Event",
  "Communication",
].map((label) => ({ label, value: label.toUpperCase() }));

const MUSIC_SUBCATEGORIES = [
  "Bollywood",
  "Hiphop",
  "Electronic",
  "Melodic",
  "Live Music",
  "Metal",
  "Rap",
  "Music House",
  "Techno",
  "K-pop",
  "Hollywood",
  "Pop",
  "Punjabi",
  "Disco",
  "Rock",
  "Afrobeat",
  "Dancehall",
  "Thumri",
  "Bolly Tech",
].map((label) => ({ label, value: label.toUpperCase() }));

export default function BrowseEvents({ showPublicHeader = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const navigate = useNavigate();

  const {
    events: apiEvents = [],
    loading,
    error,
    updateFilters,
  } = usePublicEvents();

  // Use live events from API
  const events = apiEvents;

  // If user is already logged in, push them to the dashboard browse view
  useEffect(() => {
    if (showPublicHeader && checkAuth()) {
      navigate("/dashboard/browse-events", { replace: true });
    }
  }, [showPublicHeader, navigate]);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({
        search: searchQuery || null,
        category: selectedCategory === "all" ? null : selectedCategory,
        subCategory: selectedSubCategory === "all" ? null : selectedSubCategory,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSubCategory, updateFilters]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get event location
  const getEventLocation = (event) => {
    if (event.venues?.length > 0) {
      const venue = event.venues[0];
      return `${venue.city || ""}${venue.city && venue.state ? ", " : ""}${venue.state || ""}`.trim() || "Location TBA";
    }
    return event.location || "Location TBA";
  };

  // Get event price display
  const getEventPriceDisplay = (event) => {
    if (Array.isArray(event.tickets) && event.tickets.length > 0) {
      const prices = event.tickets
        .map((t) => Number(t.price))
        .filter((p) => !isNaN(p) && p > 0);

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        return minPrice > 0 ? `From ₹${minPrice}` : "Free";
      }
    }
    return typeof event.price === "number" && event.price > 0
      ? `₹${event.price}`
      : "Free";
  };

  const filteredEvents = events || [];

  // Get trending and featured events if backend provides flags
  const trendingEvents = useMemo(() => filteredEvents.filter((e) => e.trending).slice(0, 4), [filteredEvents]);
  const featuredEvents = useMemo(() => filteredEvents.filter((e) => e.featured).slice(0, 3), [filteredEvents]);

  const activeSubcategories =
    selectedCategory === "all"
      ? []
      : selectedCategory === "WORKSHOP"
      ? WORKSHOP_SUBCATEGORIES
      : MUSIC_SUBCATEGORIES;

  const groupedByCategory = useMemo(() => {
    return CATEGORY_CONFIG.map((cat) => ({
      ...cat,
      events: filteredEvents.filter(
        (event) => (event.category || event.mainCategory || "").toUpperCase() === cat.id
      ),
    }));
  }, [filteredEvents]);

  const totalCountLabel =
    filteredEvents.length === 1 ? "1 event" : `${filteredEvents.length} events`;

  return (
    <div className="w-full text-white bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] min-h-screen">
      {showPublicHeader && <Header forceMainHeader />}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-10">
        {/* Header Section */}
        <div className="mb-8 mt-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <Ticket className="h-8 w-8 text-[#D60024]" />
            Browse Events
          </h1>
          <p className="text-[rgba(255,255,255,0.65)] text-sm sm:text-base">Discover amazing events happening near you</p>
        </div>

        {/* Search */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgba(100,200,255,0.7)]" />
            <Input
              type="search"
              placeholder="Search events by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.08)] border-2 border-[rgba(100,200,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.6)] focus:ring-2 focus:ring-[#60a5fa] focus:border-[#60a5fa] rounded-xl text-base"
            />
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1222] via-[#0c1428] to-[#0c1020] p-5 shadow-[0_24px_80px_-30px_rgba(0,0,0,0.75)] backdrop-blur-xl">
            <div className="absolute inset-px rounded-[18px] border border-white/5 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-white/85">
                <SlidersHorizontal className="h-4 w-4 text-[#D60024]" />
                <span>Showing published events only</span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {selectedCategory !== "all" && (
                  <Badge className="bg-[#D60024]/15 text-white border-[#D60024]/30">
                    Category: {CATEGORY_CONFIG.find((c) => c.id === selectedCategory)?.label}
                  </Badge>
                )}
                {selectedSubCategory !== "all" && (
                  <Badge className="bg-[#60a5fa]/15 text-[#bfdbfe] border-[#60a5fa]/30">
                    Sub: {selectedSubCategory}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge className="bg-white/10 text-white border-white/10">
                    “{searchQuery}”
                  </Badge>
                )}
                {(selectedCategory !== "all" || selectedSubCategory !== "all" || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedSubCategory("all");
                      setSearchQuery("");
                    }}
                    className="text-white bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            <div className="relative grid md:grid-cols-2 gap-3">
              {CATEGORY_CONFIG.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                const categoryCount = filteredEvents.filter(
                  (event) => (event.category || event.mainCategory || "").toUpperCase() === cat.id
                ).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory("all");
                    }}
                    className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-300 backdrop-blur ${
                      isActive
                        ? `border-transparent ring-2 ring-offset-0 ring-[#D60024]/70 shadow-[0_20px_40px_-24px_rgba(214,0,36,0.8)]`
                        : `border-white/10 hover:border-white/25`
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${cat.gradient} opacity-80`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
                    <div className="relative flex items-center justify-between gap-2 min-h-[96px]">
                      <div className="flex items-center gap-3">
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10 shadow-inner">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white/85">Category</p>
                          <p className="text-lg font-semibold text-white">{cat.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-white/75">Events</p>
                        <p className="text-xl font-bold text-white">
                          {categoryCount}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeSubcategories.length > 0 && (
              <div className="mt-5 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-sm text-white/80 mb-3">
                  <Sparkles className="h-4 w-4 text-[#60a5fa]" />
                  <span>Focus by subcategory</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedSubCategory === "all" ? "default" : "ghost"}
                    className={`rounded-full border px-4 ${
                      selectedSubCategory === "all"
                        ? "bg-[#D60024] border-[#ff4d67] text-white shadow-[0_8px_24px_-10px_rgba(214,0,36,0.7)]"
                        : "bg-white/5 text-white/85 border-white/10 hover:border-white/30"
                    }`}
                    onClick={() => setSelectedSubCategory("all")}
                  >
                    All {CATEGORY_CONFIG.find((c) => c.id === selectedCategory)?.label}
                  </Button>
                  {activeSubcategories.map((sub) => {
                    const isActive = selectedSubCategory === sub.value;
                    return (
                      <Button
                        key={sub.value}
                        size="sm"
                        variant={isActive ? "default" : "ghost"}
                        className={`rounded-full border px-4 ${
                          isActive
                            ? "bg-gradient-to-r from-[#60a5fa] to-[#22d3ee] border-[#7dd3fc] text-black font-semibold shadow-[0_8px_24px_-10px_rgba(96,165,250,0.65)]"
                            : "bg-white/5 text-white/85 border-white/10 hover:border-white/30"
                        }`}
                        onClick={() => setSelectedSubCategory(sub.value)}
                      >
                        {sub.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trending Events Section */}
        {trendingEvents.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[#D60024]" />
                Trending Now
              </h2>
              <Badge className="bg-[#D60024]/20 text-[#D60024] border border-[#D60024]/30 px-3 py-1">
                {trendingEvents.length} Events
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingEvents.map((event) => (
                <Link to={`/events/${event.slug || event.id}`} key={event.id} className="group">
                  <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.flyerImage || event.image || event.coverImage || event.thumbnail || "https://via.placeholder.com/400x250?text=Event"}
                        alt={event.title || event.eventTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <Badge className="absolute top-3 left-3 bg-[#D60024] text-white text-xs px-2 py-1">
                        {getEventPriceDisplay(event)}
                      </Badge>
                      <div className="absolute top-3 right-3">
                        <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                          <TrendingUp className="h-4 w-4 text-[#D60024]" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-base text-white mb-2 line-clamp-1 group-hover:text-[#D60024] transition-colors">
                        {event.title || event.eventTitle}
                      </h3>
                      <div className="space-y-1.5 text-xs text-[rgba(255,255,255,0.75)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-[#60a5fa]" />
                          <span>{formatDate(event.startDate || event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#60a5fa]" />
                          <span className="line-clamp-1">{getEventLocation(event)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-[#60a5fa]" />
                          <span>{event.attendees?.toLocaleString()} interested</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Browse by category grid */}
        <div>
          <div className="mb-5 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D60024]" />
              <h2 className="text-2xl font-bold text-white">Browse by category</h2>
            </div>
            {/* <p className="text-[rgba(255,255,255,0.65)] text-sm">
              {totalCountLabel} • Only published events from the live API
            </p> */}
          </div>

          <div className="space-y-8">
            {groupedByCategory.map((cat) => {
              if (cat.events.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl bg-gradient-to-r ${cat.gradient} flex items-center justify-center text-white border border-white/10`}
                      >
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/60">Category</p>
                        <h3 className="text-xl font-semibold text-white">{cat.label}</h3>
                      </div>
                    </div>
                    <Badge className="bg-white/10 text-white border-white/10">{cat.events.length} events</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {cat.events.map((event) => (
                      <Link to={`/events/${event.slug || event.id}`} key={event.id} className="group">
                        <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden h-full">
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={
                                event.flyerImage ||
                                event.image ||
                                event.coverImage ||
                                event.thumbnail ||
                                "https://via.placeholder.com/400x250?text=Event"
                              }
                              alt={event.title || event.eventTitle}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            <Badge className="absolute top-3 left-3 bg-[#D60024] text-white text-xs px-2 py-1">
                              {getEventPriceDisplay(event)}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-base text-white mb-2 line-clamp-1 group-hover:text-[#D60024] transition-colors">
                              {event.title || event.eventTitle}
                            </h3>
                            <div className="space-y-1.5 text-xs text-[rgba(255,255,255,0.75)]">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-[#60a5fa]" />
                                <span>{formatDate(event.startDate || event.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-[#60a5fa]" />
                                <span className="line-clamp-1">{getEventLocation(event)}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[10px] text-white/80">
                                {/* {event.category && (
                                  <Badge className="bg-white/10 text-white border-white/10 px-2 py-0">
                                    {event.category}
                                  </Badge>
                                )} */}
                                {event.subCategory && (
                                  <Badge className="bg-white/10 text-white border-white/10 px-2 py-0">
                                    {event.subCategory}
                                  </Badge>
                                )}
                                {(event.eventStatus) && (
                                  <Badge className="bg-[#60a5fa]/20 text-[#bfdbfe] border-[#60a5fa]/30 px-2 py-0">
                                    {[event.eventStatus].filter(Boolean)}
                                  </Badge>
                                )}
                              </div>
                              {event.attendees && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-[#60a5fa]" />
                                  <span>{event.attendees.toLocaleString()} interested</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.18)]">
                <div className="h-48 bg-[rgba(255,255,255,0.12)] rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 bg-[rgba(255,255,255,0.18)] rounded w-3/4"></div>
                  <div className="h-4 bg-[rgba(255,255,255,0.14)] rounded w-1/2"></div>
                  <div className="h-4 bg-[rgba(255,255,255,0.14)] rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-[rgba(255,255,255,0.4)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No events found</h3>
              <p className="text-[rgba(255,255,255,0.65)] mb-6">
                {searchQuery ? 'Try adjusting your search or filters' : 'No events available in this category'}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  updateFilters({ search: null });
                }}
                className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}