import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Search, Filter, TrendingUp, Star, Music, Utensils, Briefcase, Palette, Trophy, Heart, ChevronRight, Users, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import { buildUrl } from "@/config/api";

// Comprehensive dummy event data
const DUMMY_EVENTS = [
  {
    id: "evt001",
    title: "Coldplay Music of the Spheres Tour",
    category: "MUSIC",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    location: "DY Patil Stadium, Mumbai",
    price: 2500,
    tickets: [{ price: 2500 }, { price: 5000 }],
    attendees: 45000,
    trending: true,
    featured: true
  },
  {
    id: "evt002",
    title: "Sunburn EDM Festival 2024",
    category: "MUSIC",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Vagator Beach, Goa",
    price: 1800,
    tickets: [{ price: 1800 }, { price: 3500 }],
    attendees: 25000,
    trending: true
  },
  {
    id: "evt003",
    title: "Indie Music Night",
    category: "MUSIC",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Hard Rock Cafe, Bangalore",
    price: 800,
    tickets: [{ price: 800 }],
    attendees: 500
  },
  {
    id: "evt004",
    title: "IPL 2024 - Mumbai vs Chennai",
    category: "SPORTS",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Wankhede Stadium, Mumbai",
    price: 1500,
    tickets: [{ price: 1500 }, { price: 3000 }],
    attendees: 33000,
    featured: true
  },
  {
    id: "evt005",
    title: "Mumbai Marathon 2024",
    category: "SPORTS",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Marine Drive, Mumbai",
    price: 500,
    tickets: [{ price: 500 }],
    attendees: 15000
  },
  {
    id: "evt006",
    title: "Food & Wine Festival",
    category: "FOOD",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Jawaharlal Nehru Stadium, Delhi",
    price: 1200,
    tickets: [{ price: 1200 }],
    attendees: 8000,
    trending: true
  },
  {
    id: "evt007",
    title: "Street Food Carnival",
    category: "FOOD",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Phoenix Marketcity, Pune",
    price: 300,
    tickets: [{ price: 300 }],
    attendees: 5000
  },
  {
    id: "evt008",
    title: "Tech Summit 2024",
    category: "BUSINESS",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: "BIEC, Bangalore",
    price: 1500,
    tickets: [{ price: 1500 }],
    attendees: 10000,
    featured: true
  },
  {
    id: "evt009",
    title: "Startup Networking Event",
    category: "BUSINESS",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: "WeWork, Hyderabad",
    price: 0,
    tickets: [{ price: 0 }],
    attendees: 200
  },
  {
    id: "evt010",
    title: "Art Exhibition - Modern India",
    category: "ART",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    location: "National Gallery, Delhi",
    price: 200,
    tickets: [{ price: 200 }],
    attendees: 1000
  },
  {
    id: "evt011",
    title: "Stand-up Comedy Night",
    category: "ART",
    image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Canvas Laugh Club, Mumbai",
    price: 800,
    tickets: [{ price: 800 }],
    attendees: 300
  },
  {
    id: "evt012",
    title: "Yoga & Wellness Retreat",
    category: "SPORTS",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    startDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Rishikesh, Uttarakhand",
    price: 5000,
    tickets: [{ price: 5000 }],
    attendees: 100
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Events', icon: Star, color: 'from-[#D60024] to-[#ff4d67]' },
  { id: 'MUSIC', name: 'Music', icon: Music, color: 'from-[#8b5cf6] to-[#a78bfa]' },
  { id: 'SPORTS', name: 'Sports', icon: Trophy, color: 'from-[#22c55e] to-[#4ade80]' },
  { id: 'FOOD', name: 'Food & Drink', icon: Utensils, color: 'from-[#f97316] to-[#fb923c]' },
  { id: 'BUSINESS', name: 'Business', icon: Briefcase, color: 'from-[#3b82f6] to-[#60a5fa]' },
  { id: 'ART', name: 'Art & Culture', icon: Palette, color: 'from-[#ec4899] to-[#f472b6]' },
];

export default function BrowseEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("category"); // 'category' or 'grid'
  
  const {
    events: apiEvents = [],
    loading,
    error,
    updateFilters,
  } = usePublicEvents();

  // Use dummy data for now
  const events = DUMMY_EVENTS;

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

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === 'all' || event.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, category]);

  // Group events by category
  const eventsByCategory = useMemo(() => {
    const grouped = {};
    CATEGORIES.forEach(cat => {
      if (cat.id === 'all') return;
      grouped[cat.id] = filteredEvents.filter(e => e.category === cat.id);
    });
    return grouped;
  }, [filteredEvents]);

  // Get trending and featured events
  const trendingEvents = useMemo(() => filteredEvents.filter(e => e.trending).slice(0, 4), [filteredEvents]);
  const featuredEvents = useMemo(() => filteredEvents.filter(e => e.featured).slice(0, 3), [filteredEvents]);

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-10 text-white bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] min-h-screen">
      {/* Header Section */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3 mb-2">
          <Ticket className="h-8 w-8 text-[#D60024]" />
          Browse Events
        </h1>
        <p className="text-[rgba(255,255,255,0.65)] text-sm sm:text-base">Discover amazing events happening near you</p>
      </div>

      {/* Search and Category Pills */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgba(100,200,255,0.7)]" />
          <Input
            type="search"
            placeholder="Search events by name, location, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.08)] border-2 border-[rgba(100,200,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.6)] focus:ring-2 focus:ring-[#60a5fa] focus:border-[#60a5fa] rounded-xl text-base"
          />
        </div>
        
        {/* Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                    : 'bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.75)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(100,200,255,0.2)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Events Section */}
      {trendingEvents.length > 0 && category === 'all' && (
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
              <Link to={`/events/${event.id}`} key={event.id} className="group">
                <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
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
                      {event.title}
                    </h3>
                    <div className="space-y-1.5 text-xs text-[rgba(255,255,255,0.75)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#60a5fa]" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#60a5fa]" />
                        <span className="line-clamp-1">{event.location}</span>
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

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && category === 'all' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="h-6 w-6 text-[#D60024]" />
              Featured Events
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {featuredEvents.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="group">
                <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white text-xs px-3 py-1.5 font-semibold">
                      Featured
                    </Badge>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-xl text-white mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/90">{formatDate(event.startDate)}</span>
                        <span className="text-lg font-bold text-[#D60024]">{getEventPriceDisplay(event)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category Sections */}
      {category === 'all' ? (
        <div className="space-y-10">
          {CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => {
            const categoryEvents = eventsByCategory[cat.id] || [];
            if (categoryEvents.length === 0) return null;
            const Icon = cat.icon;
            
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Icon className="h-6 w-6 text-[#60a5fa]" />
                    {cat.name}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setCategory(cat.id)}
                    className="text-[#60a5fa] hover:text-white hover:bg-[rgba(59,130,246,0.15)]"
                  >
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryEvents.slice(0, 4).map((event) => (
                    <Link to={`/events/${event.id}`} key={event.id} className="group">
                      <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden h-full">
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          <Badge className="absolute top-3 left-3 bg-[#D60024] text-white text-xs px-2 py-1">
                            {getEventPriceDisplay(event)}
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-bold text-sm text-white mb-2 line-clamp-1 group-hover:text-[#D60024] transition-colors">
                            {event.title}
                          </h3>
                          <div className="space-y-1 text-xs text-[rgba(255,255,255,0.75)]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-[#60a5fa]" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-[#60a5fa]" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
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
      ) : (
        <div>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white">
              {CATEGORIES.find(c => c.id === category)?.name || 'Events'}
            </h2>
            <p className="text-[rgba(255,255,255,0.65)] text-sm">
              {filteredEvents.length} events found
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="group">
                <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <Badge className="absolute top-3 left-3 bg-[#D60024] text-white text-xs px-2 py-1">
                      {getEventPriceDisplay(event)}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base text-white mb-2 line-clamp-1 group-hover:text-[#D60024] transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1.5 text-xs text-[rgba(255,255,255,0.75)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#60a5fa]" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#60a5fa]" />
                        <span className="line-clamp-1">{event.location}</span>
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
      )}

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
                setCategory('all');
              }}
              className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}