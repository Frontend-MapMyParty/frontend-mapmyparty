import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, Calendar, MapPin, Clock, Users, Share2, Heart, 
  Ticket, Star, TrendingUp, Mail, Phone, Globe, Instagram, 
  Facebook, Twitter, Plus, Minus, X, Check, Info, Image as ImageIcon,
  Navigation, Building, User, BookOpen, Medal, Loader2, ShieldCheck, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, buildUrl } from "@/config/api";
import { fetchSession, resetSessionCache, isAuthenticated as isAuthedSync } from "@/utils/auth";

const FALLBACK_IMAGE = "https://via.placeholder.com/1200x600?text=Event";
const SPONSOR_PLACEHOLDER = "https://via.placeholder.com/200x200?text=Sponsor";

const EventDetailNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isLiked, setIsLiked] = useState(false);
  const [ticketQuantities, setTicketQuantities] = useState({});

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [isSessionAuthed, setIsSessionAuthed] = useState(isAuthedSync());
  const [sessionUser, setSessionUser] = useState(null);

  const hasSponsors = useMemo(
    () => Array.isArray(event?.sponsors) && event.sponsors.length > 0 && (event?.isSponsored ?? true),
    [event?.isSponsored, event?.sponsors]
  );

  const sponsorsSorted = useMemo(() => {
    if (!hasSponsors) return [];
    return [...event.sponsors].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }, [event?.sponsors, hasSponsors]);

  const normalizeEvent = (raw = {}) => {
    const data = raw?.data ?? raw; // handle api shapes {data:{...}}
    const startDate = data.startDate || data.date || data.start_time || data.start;
    const endDate = data.endDate || data.end_time || data.end;
    const venue = data.venue || (data.venues && data.venues[0]) || {};
    const cityState = `${data.city || venue.city || ""}${
      (data.city || venue.city) && (data.state || venue.state) ? ", " : ""
    }${data.state || venue.state || ""}`.trim();

    const galleryImages = Array.isArray(data.galleryImages)
      ? data.galleryImages
      : Array.isArray(data.images)
      ? data.images
          .filter((img) =>
            typeof img === "object" ? (img.type || "").toUpperCase() === "EVENT_GALLERY" : true
          )
          .map((img) => (typeof img === "object" ? img.url : img))
      : data.gallery || [];

    const tickets = Array.isArray(data.tickets)
      ? data.tickets.map((t) => ({
          id: t.id || t._id,
          name: t.name || t.title || "Ticket",
          description: t.info || t.description || "",
          price: Number(t.price) || 0,
          available: Math.max(
            0,
            (Number(t.totalQty) || 0) -
              (Number(t.soldQty) || Number(t.bookedQuantity) || 0)
          ),
        }))
      : [];

    const sponsors = Array.isArray(data.sponsors)
      ? data.sponsors.map((s) => {
          const nested = s.sponsor || {};
          return {
            id: s.id || s._id || s.sponsorId || nested.id || nested._id || nested.name || nested.logoUrl || s.name || s.logoUrl || s.logo || s.image,
            name: s.name || nested.name || s.brandName || "Sponsor",
            logo:
              s.logoUrl ||
              nested.logoUrl ||
              s.logo ||
              nested.logo ||
              s.image ||
              nested.image ||
              s.flyerImage ||
              s.flyerImageUrl ||
              SPONSOR_PLACEHOLDER,
            website: s.websiteUrl || nested.websiteUrl || s.website || nested.website || s.url || nested.url || s.link || "",
            isPrimary: !!(s.isPrimary ?? s.primary ?? nested.isPrimary),
            description: s.description || nested.description || s.about || nested.about || "",
          };
        })
      : [];

    const reviewsCount = Array.isArray(data.reviews)
      ? data.reviews.length
      : data._count?.reviews || data.reviews || 0;

    return {
      id: data.id || data._id,
      slug: data.slug || data.id,
      title: data.title || data.eventTitle || "Untitled Event",
      category: data.category || data.mainCategory || "EVENT",
      image:
        data.flyerImage ||
        data.flyerImageUrl ||
        data.coverImage ||
        data.image ||
        galleryImages[0] ||
        FALLBACK_IMAGE,
      startDate,
      endDate,
      location:
        typeof data.location === "string"
          ? data.location
          : venue.name || cityState || "Location TBA",
      venue:
        typeof data.venue === "string"
          ? data.venue
          : venue.name || "Venue TBA",
      address:
        data.address ||
        data.fullAddress ||
        venue.fullAddress ||
        venue.address ||
        [data.address, venue.address, cityState, data.pincode || venue.pincode]
          .filter(Boolean)
          .join(", ") ||
        "Address TBA",
      coordinates: data.coordinates || venue.coordinates,
      attendees:
        data.attendees ||
        data.analytics?.totalAttendees ||
        data.analytics?.attendees ||
        data._count?.bookings ||
        data.stats?.confirmedBookings ||
        0,
      rating: data.rating || data.averageRating || 0,
      description: data.description || data.summary || "No description available.",
      about: data.description || data.summary || "No description available.",
      highlights: data.highlights || [],
      gallery: galleryImages.length > 0 ? galleryImages : [FALLBACK_IMAGE],
      tickets,
      organizer: data.organizer
        ? {
            name: data.organizer.name || "Organizer",
            email: data.organizer.email || "",
            phone: data.organizer.phone || "",
            website: data.organizer.website || "",
            logo:
              data.organizer.logo ||
              "https://via.placeholder.com/200x200?text=Organizer",
            verified: !!data.organizer.isVerified,
            bio: data.organizer.description || "",
            eventsOrganized: data.organizer.eventsOrganized || 0,
            followers: data.organizer.followers || 0,
          }
        : {
            name: data.organizerName || "Organizer",
            email: data.organizerEmail || "",
            phone: data.organizerPhone || "",
            website: data.organizerWebsite || "",
            logo: "https://via.placeholder.com/200x200?text=Organizer",
            verified: false,
            bio: "",
            eventsOrganized: 0,
            followers: 0,
          },
      tags: data.tags || [],
      ageRestriction: data.ageRestriction || data.age_limit || "Not specified",
      dresscode: data.dresscode || "Not specified",
      parking: data.parking || "Not specified",
      accessibility: data.accessibility || "Not specified",
      reviews: reviewsCount,
      advisory: data.advisory || data.advisories || null,
      terms: data.TC?.terms || data.terms || "",
      stats: data.stats || data._count || {},
      artists: data.artists || [],
      type: data.type,
      publishStatus: data.publishStatus,
      eventStatus: data.eventStatus,
      organizerNote: data.organizerNote,
      subCategory: data.subCategory,
      categorySlug: data.categorySlug,
      questions: data.questions,
      sponsors,
      flyerImage: data.flyerImage,
      flyerPublicId: data.flyerPublicId,
      isSponsored: data.isSponsored,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      statsCount: data._count,
      revenue: data.stats?.totalRevenue,
      ticketsSold: data.stats?.totalTicketsSold,
      confirmedBookings: data.stats?.confirmedBookings,
      capacity: venue.totalQty || tickets.reduce((sum, t) => sum + (t.available || 0), 0),
      primaryVenue: venue,
      raw: data,
    };
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const tryFetch = async (path) => {
        const response = await apiFetch(path, { method: "GET" });
        return (
          response?.data?.event ||
          response?.data?.data ||
          response?.data ||
          response
        );
      };

      try {
        setLoading(true);
        let raw = null;

        // 1) Try by id/slug using main endpoint
        try {
          raw = await tryFetch(`/api/event/${encodeURIComponent(id)}`);
        } catch (errMain) {
          console.warn("Primary fetch failed, trying slug and list fallback", errMain);
        }

        // 2) Try explicit slug endpoint if available
        if (!raw) {
          try {
            raw = await tryFetch(`/api/event/slug/${encodeURIComponent(id)}`);
          } catch (errSlug) {
            console.warn("Slug fetch failed", errSlug);
          }
        }

        // 3) Try listing all events and match by slug/id
        if (!raw) {
          try {
            const listRes = await tryFetch(`/api/event`);
            const list = Array.isArray(listRes?.events) ? listRes.events : Array.isArray(listRes) ? listRes : listRes?.data || [];
            raw = list.find(
              (e) =>
                e?.id === id ||
                e?._id === id ||
                e?.slug === id ||
                e?.eventId === id
            );
          } catch (errList) {
            console.warn("List fetch failed", errList);
          }
        }

        if (raw) {
          const normalized = normalizeEvent(raw);
          setEvent(normalized);
          // Do not auto-open lightbox; show hero directly
          setSelectedImage(null);
        } else {
          setEvent(null);
        }
      } catch (err) {
        console.error("Failed to fetch event", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleQuantityChange = (ticketId, change) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) + change)
    }));
  };

  const totalTickets = useMemo(() => {
    return Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [ticketQuantities]);

  const totalAmount = useMemo(() => {
    if (!event) return 0;
    return event.tickets.reduce((sum, ticket) => {
      const qty = ticketQuantities[ticket.id] || 0;
      return sum + (ticket.price * qty);
    }, 0);
  }, [ticketQuantities, event]);

  const persistUserProfile = (userData = {}, fallback = {}) => {
    const merged = { ...fallback, ...(userData || {}) };
    const sanitized = Object.fromEntries(
      Object.entries(merged).filter(([, value]) => value !== undefined && value !== null && value !== "")
    );
    if (Object.keys(sanitized).length === 0) return;
    try {
      sessionStorage.setItem("userProfile", JSON.stringify(sanitized));
      if (sanitized.name) sessionStorage.setItem("userName", sanitized.name);
      if (sanitized.email) sessionStorage.setItem("userEmail", sanitized.email);
      if (sanitized.phone || sanitized.phoneNumber) {
        sessionStorage.setItem("userPhone", sanitized.phone || sanitized.phoneNumber);
      }
      if (sanitized.role) sessionStorage.setItem("role", sanitized.role);
      sessionStorage.setItem("isAuthenticated", "true");
    } catch (storageError) {
      console.warn("⚠️ Failed to persist user profile", storageError);
    }
  };

  const extractUserFromResponse = (payload) => {
    if (!payload || typeof payload !== "object") return null;
    if (payload.user && typeof payload.user === "object") return payload.user;
    if (payload.data && typeof payload.data === "object") {
      if (payload.data.user && typeof payload.data.user === "object") return payload.data.user;
      if (!Array.isArray(payload.data) && !payload.data.accessToken && !payload.data.token) {
        return payload.data;
      }
    }
    return null;
  };

  const ensureSession = async () => {
    setAuthLoading(true);
    try {
      const session = await fetchSession();
      if (session?.isAuthenticated) {
        setIsSessionAuthed(true);
        setSessionUser(session.user || null);
        return true;
      }
    } catch (err) {
      console.warn("Auth check failed, using cached flag", err);
      if (isAuthedSync()) {
        setIsSessionAuthed(true);
        return true;
      }
    } finally {
      setAuthLoading(false);
    }
    return false;
  };

  const bookTickets = async () => {
    setBookingLoading(true);
    try {
      // Placeholder booking flow; replace with actual booking API when ready
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccessModalOpen(true);
      toast.success("Your tickets are booked! Confirmation sent to your email.");
    } catch (err) {
      toast.error(err?.message || "Booking failed, please try again");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (totalTickets === 0) {
      toast.error("Please select at least one ticket");
      return;
    }
    const authed = await ensureSession();
    if (authed) {
      await bookTickets();
    } else {
      setAuthModalOpen(true);
      toast.message("Almost there!", {
        description: "Sign in to complete your booking in seconds.",
      });
    }
  };

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginForm;
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await apiFetch("auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role: "USER" }),
      });
      const userDataCandidate = extractUserFromResponse(res);
      const userWithRole = userDataCandidate ? { ...userDataCandidate, role: "USER" } : { email, role: "USER" };
      persistUserProfile(userWithRole, { email, role: "USER", authProvider: "password", hasPassword: true });
      resetSessionCache();
      const session = await fetchSession().catch(() => null);
      setIsSessionAuthed(true);
      setSessionUser(session?.user || userWithRole);
      setAuthModalOpen(false);
      await bookTickets();
    } catch (err) {
      toast.error(err?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInlineSignup = async (e) => {
    e.preventDefault();
    const { name, email, phone, password } = signupForm;
    if (!name || !email || !phone || !password) {
      toast.error("Please fill all fields");
      return;
    }
    const phoneDigits = (phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await apiFetch("auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, phone: phoneDigits, password, role: "USER" }),
      });
      const signupUserData = extractUserFromResponse(res) || { name, email, phone: phoneDigits, role: "USER" };
      persistUserProfile(signupUserData, {
        name,
        email,
        phone: phoneDigits,
        role: "USER",
        authProvider: "password",
        hasPassword: true,
      });
      resetSessionCache();
      const session = await fetchSession().catch(() => null);
      setIsSessionAuthed(true);
      setSessionUser(session?.user || signupUserData);
      setAuthModalOpen(false);
      await bookTickets();
    } catch (err) {
      toast.error(err?.message || "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirect = encodeURIComponent(window.location.href);
    const googleAuthUrl = buildUrl(`api/auth/google?redirect=${redirect}`);
    window.location.href = googleAuthUrl;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out ${event?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D60024] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
          <Button onClick={() => navigate("/dashboard/browse-events")} className="bg-gradient-to-r from-[#D60024] to-[#ff4d67]">
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border border-[rgba(100,200,255,0.3)]"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </Button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate(`/events/${event.id}/overview`)}
            className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border border-[rgba(100,200,255,0.3)]"
            title="View Overview"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsLiked(!isLiked)}
            className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border border-[rgba(100,200,255,0.3)]"
            title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-[#D60024] text-[#D60024]' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            onClick={handleShare}
            className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border border-[rgba(100,200,255,0.3)]"
            title="Share event"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <Badge className="bg-[#D60024] text-white mb-4 px-3 py-1">{event.category}</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 md:gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#60a5fa]" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#60a5fa]" />
                <span>{formatTime(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#60a5fa]" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#60a5fa]" />
                <span>{event.attendees?.toLocaleString()} attending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-[rgba(100,200,255,0.2)]">
              {["about", "gallery", "location", "organizer", hasSponsors ? "sponsors" : null]
                .filter(Boolean)
                .map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white"
                        : "bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.75)] hover:bg-[rgba(255,255,255,0.12)]"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
            </div>

            {/* About Tab */}
            {activeTab === "about" && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Info className="h-6 w-6 text-[#D60024]" />
                    About This Event
                  </h2>
                  <p className="text-[rgba(255,255,255,0.85)] leading-relaxed whitespace-pre-line mb-6">
                    {event.about}
                  </p>
                  
                  <h3 className="text-xl font-bold text-white mb-3">Event Highlights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {event.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 text-[rgba(255,255,255,0.85)]">
                        <Check className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-[rgba(100,200,255,0.2)] grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[rgba(255,255,255,0.65)] text-sm mb-1">Age Restriction</p>
                      <p className="text-white font-semibold">{event.ageRestriction}</p>
                    </div>
                    <div>
                      <p className="text-[rgba(255,255,255,0.65)] text-sm mb-1">Dress Code</p>
                      <p className="text-white font-semibold">{event.dresscode}</p>
                    </div>
                    <div>
                      <p className="text-[rgba(255,255,255,0.65)] text-sm mb-1">Parking</p>
                      <p className="text-white font-semibold">{event.parking}</p>
                    </div>
                    <div>
                      <p className="text-[rgba(255,255,255,0.65)] text-sm mb-1">Accessibility</p>
                      <p className="text-white font-semibold">{event.accessibility}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery Tab */}
            {activeTab === "gallery" && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <ImageIcon className="h-6 w-6 text-[#D60024]" />
                    Event Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.gallery.map((image, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Tab */}
            {activeTab === "location" && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Navigation className="h-6 w-6 text-[#D60024]" />
                    Location & Venue
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-[#60a5fa] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-[rgba(255,255,255,0.65)] text-sm">Venue</p>
                        <p className="text-white font-semibold text-lg">{event.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#60a5fa] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-[rgba(255,255,255,0.65)] text-sm">Address</p>
                        <p className="text-white font-semibold">{event.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.2)]">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(event.address)}`}
                      allowFullScreen
                      title="Event Location Map"
                      className="grayscale"
                    ></iframe>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    <Button
                      className="absolute bottom-4 right-4 bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`, '_blank')}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizer Tab */}
            {activeTab === "organizer" && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <User className="h-6 w-6 text-[#D60024]" />
                    Organized By
                  </h2>
                  
                  <div className="flex items-start gap-4 mb-6">
                    <img
                      src={event.organizer.logo}
                      alt={event.organizer.name}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-[rgba(100,200,255,0.3)]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{event.organizer.name}</h3>
                        {event.organizer.verified && (
                          <Badge className="bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-[rgba(255,255,255,0.75)] text-sm mb-3">{event.organizer.bio}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-[rgba(255,255,255,0.65)]">
                          <strong className="text-white">{event.organizer.eventsOrganized}</strong> Events
                        </span>
                        <span className="text-[rgba(255,255,255,0.65)]">
                          <strong className="text-white">{event.organizer.followers.toLocaleString()}</strong> Followers
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)]">
                      <Mail className="h-5 w-5 text-[#60a5fa]" />
                      <span className="text-white">{event.organizer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)]">
                      <Phone className="h-5 w-5 text-[#60a5fa]" />
                      <span className="text-white">{event.organizer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)]">
                      <Globe className="h-5 w-5 text-[#60a5fa]" />
                      <a href={event.organizer.website} target="_blank" rel="noopener noreferrer" className="text-[#60a5fa] hover:underline">
                        {event.organizer.website}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-[rgba(100,200,255,0.3)] text-white hover:bg-[rgba(59,130,246,0.15)]">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" className="flex-1 border-[rgba(100,200,255,0.3)] text-white hover:bg-[rgba(59,130,246,0.15)]">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" className="flex-1 border-[rgba(100,200,255,0.3)] text-white hover:bg-[rgba(59,130,246,0.15)]">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sponsors Tab */}
            {activeTab === "sponsors" && hasSponsors && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.08)] rounded-xl">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-[#D60024]/15 border border-[#D60024]/30 text-[#D60024]">
                        <Medal className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Sponsors</h2>
                        <p className="text-[rgba(255,255,255,0.7)] text-sm">
                          Proud partners making this experience possible
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-white/10 text-white border border-white/20">
                      {sponsorsSorted.length} {sponsorsSorted.length === 1 ? "Sponsor" : "Sponsors"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sponsorsSorted.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className={`p-5 rounded-xl border backdrop-blur-sm bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200 shadow-[0_10px_40px_rgba(0,0,0,0.35)] ${
                          sponsor.isPrimary
                            ? "border-[#D60024]/50 ring-1 ring-[#D60024]/60"
                            : "border-[rgba(100,200,255,0.2)]"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={sponsor.logo || SPONSOR_PLACEHOLDER}
                            alt={sponsor.name}
                            className="w-16 h-16 rounded-lg object-cover border border-[rgba(255,255,255,0.1)] bg-black/30"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-lg font-semibold text-white">{sponsor.name}</h3>
                              {sponsor.isPrimary && (
                                <Badge className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white border-0">
                                  Primary Sponsor
                                </Badge>
                              )}
                            </div>
                            <p className="text-[rgba(255,255,255,0.75)] text-sm leading-relaxed line-clamp-3">
                              {sponsor.description || "Key partner supporting this event."}
                            </p>
                            {sponsor.website && (
                              <a
                                href={sponsor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-3 text-[#60a5fa] hover:underline text-sm font-medium"
                              >
                                <Globe className="h-4 w-4" />
                                Visit Website
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-[#D60024]" />
                    Select Tickets
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {event.tickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)]">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{ticket.name}</h4>
                            <p className="text-xs text-[rgba(255,255,255,0.65)]">{ticket.description}</p>
                          </div>
                          <span className="text-lg font-bold text-[#D60024]">₹{ticket.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-[rgba(255,255,255,0.65)]">{ticket.available} available</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(ticket.id, -1)}
                              disabled={!ticketQuantities[ticket.id]}
                              className="h-8 w-8 p-0 border-[rgba(100,200,255,0.3)]"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-white">{ticketQuantities[ticket.id] || 0}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(ticket.id, 1)}
                              className="h-8 w-8 p-0 border-[rgba(100,200,255,0.3)]"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6 p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)]">
                    <div className="flex justify-between text-sm">
                      <span className="text-[rgba(255,255,255,0.75)]">Total Tickets</span>
                      <span className="font-semibold text-white">{totalTickets}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[rgba(255,255,255,0.75)]">Subtotal</span>
                      <span className="font-semibold text-white">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[rgba(255,255,255,0.75)]">Booking Fee</span>
                      <span className="font-semibold text-white">₹{(totalAmount * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-[rgba(100,200,255,0.2)] flex justify-between">
                      <span className="font-semibold text-white">Total Amount</span>
                      <span className="text-xl font-bold text-[#D60024]">₹{(totalAmount * 1.05).toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBookNow}
                    disabled={totalTickets === 0}
                    className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all text-base py-6"
                  >
                    <Ticket className="h-5 w-5 mr-2" />
                    Book Now
                  </Button>

                  <p className="text-xs text-center text-[rgba(255,255,255,0.5)] mt-4">
                    Secure payment • Instant confirmation
                  </p>
                </CardContent>
              </Card>

              {/* Event Stats */}
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl mt-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-[#fbbf24]" />
                      <span className="text-2xl font-bold text-white">{event.rating}</span>
                    </div>
                    <span className="text-sm text-[rgba(255,255,255,0.65)]">{event.reviews} reviews</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.75)]">
                    <TrendingUp className="h-4 w-4 text-[#22c55e]" />
                    <span>Trending in {event.category}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={selectedImage}
            alt="Gallery"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Auth Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="border border-white/10 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111827] text-white max-w-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#22c55e]" />
              Sign in to book instantly
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Secure checkout with email or Google. We’ll auto-apply your details to the ticket.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={authMode} onValueChange={setAuthMode} className="mt-2">
            <TabsList className="grid grid-cols-2 bg-white/10">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4 space-y-4">
              <form className="space-y-4" onSubmit={handleInlineLogin}>
                <div className="space-y-2">
                  <Label htmlFor="inline-email">Email</Label>
                  <Input
                    id="inline-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-password">Password</Label>
                  <Input
                    id="inline-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full py-5 bg-gradient-to-r from-[#D60024] to-[#ff4d67]" disabled={authLoading}>
                  {authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing you in...
                    </span>
                  ) : (
                    "Login & Book"
                  )}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-white/60">or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/20 text-white bg-white/5"
                onClick={handleGoogleLogin}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="mt-4 space-y-4">
              <form className="space-y-4" onSubmit={handleInlineSignup}>
                <div className="space-y-2">
                  <Label htmlFor="inline-name">Full Name</Label>
                  <Input
                    id="inline-name"
                    placeholder="Your name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-signup-email">Email</Label>
                  <Input
                    id="inline-signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-signup-phone">Phone</Label>
                  <Input
                    id="inline-signup-phone"
                    type="tel"
                    placeholder="10-15 digits"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-signup-password">Password</Label>
                  <Input
                    id="inline-signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full py-5 bg-gradient-to-r from-[#22c55e] to-[#16a34a]" disabled={authLoading}>
                  {authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating your account...
                    </span>
                  ) : (
                    "Sign Up & Book"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="border border-[#22c55e]/30 bg-gradient-to-br from-[#0b1220] via-[#0d1b2a] to-[#0f172a] text-white max-w-lg">
          <DialogHeader className="space-y-2 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center">
              <Check className="h-7 w-7 text-[#22c55e]" />
            </div>
            <DialogTitle className="text-2xl">Ticket booked successfully</DialogTitle>
            <DialogDescription className="text-white/70">
              We’ve emailed your ticket to{" "}
              <span className="text-white font-semibold">
                {sessionUser?.email || loginForm.email || signupForm.email || "your email"}
              </span>
              . See you at the event!
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Event</span>
              <span className="font-semibold text-white">{event?.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Tickets</span>
              <span className="font-semibold text-white">{totalTickets}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Amount</span>
              <span className="font-semibold text-[#22c55e]">₹{(totalAmount * 1.05).toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-white/10 space-y-2">
              {event?.tickets
                ?.filter((ticket) => (ticketQuantities[ticket.id] || 0) > 0)
                .map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between text-sm text-white/80">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#D60024]" />
                      {ticket.name}
                    </span>
                    <span className="font-semibold">
                      {ticketQuantities[ticket.id]} × ₹{ticket.price.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <Button
            className="w-full mt-4 bg-gradient-to-r from-[#D60024] to-[#ff4d67]"
            onClick={() => setSuccessModalOpen(false)}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailNew;
