import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import { buildUrl } from "@/config/api";

export default function BrowseEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  
  const {
    events: apiEvents = [],
    loading,
    error,
    updateFilters,
  } = usePublicEvents();

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ 
        search: searchQuery || null,
        category: category === "all" ? null : category.toUpperCase()
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, category, updateFilters]);

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

  // Get event image with fallbacks
  const getEventImage = (event) => {
    const normalizeImageUrl = (src) => {
      if (!src || typeof src !== "string") return null;
      const trimmed = src.trim().replace(/[\\,]+$/, "");
      if (!trimmed) return null;
      if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
        return trimmed;
      }
      return buildUrl(trimmed);
    };

    if (event.images?.length > 0) {
      const galleryImage = event.images.find(img => img.type === "EVENT_GALLERY") || event.images[0];
      const normalized = normalizeImageUrl(galleryImage?.url || galleryImage?.imageUrl);
      if (normalized) return normalized;
    }

    const directSources = [event.flyerImage, event.flyerImageUrl, event.image, event.coverImage];
    for (const src of directSources) {
      const normalized = normalizeImageUrl(src);
      if (normalized) return normalized;
    }

    return "/placeholder-event.jpg";
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
        .map(t => Number(t.price))
        .filter(p => !isNaN(p) && p > 0);
      
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        return minPrice > 0 ? `From ₹${minPrice}` : "Free";
      }
    }
    return typeof event.price === "number" && event.price > 0 
      ? `₹${event.price}` 
      : "Free";
  };

  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Events</h1>
        <p className="text-gray-600">Discover upcoming events near you</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search events..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="food">Food & Drink</option>
            <option value="art">Art & Culture</option>
            <option value="business">Business</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">Error loading events. Please try again later.</p>
        </div>
      ) : apiEvents.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No events found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apiEvents.map((event) => (
            <Link to={`/events/${event.id}`} key={event.id} className="group">
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getEventImage(event) || "/placeholder-event.jpg"}
                    alt={event.title || "Event"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-event.jpg";
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
                    {getEventPriceDisplay(event)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-red-600 transition-colors">
                    {event.title || "Untitled Event"}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                    <span>{formatDate(event.startDate || event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1">{getEventLocation(event)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {apiEvents.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline" className="px-8">
            Load More Events
          </Button>
        </div>
      )}
    </div>
  );
}