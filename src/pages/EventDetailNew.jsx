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
  ChevronLeft, ChevronDown, Calendar, MapPin, Clock, Users, Share2, Heart, 
  Ticket, Star, TrendingUp, Mail, Phone, Globe, Instagram, 
  Facebook, Twitter, Plus, Minus, X, Check, Info, Image as ImageIcon,
  Navigation, Building, User, BookOpen, Medal, Loader2, ShieldCheck, Sparkles,
  AlertTriangle, Megaphone
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
  const [advisoryModalOpen, setAdvisoryModalOpen] = useState(false);
  const [tcOpen, setTcOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const normalizedFaqs = useMemo(() => {
    if (Array.isArray(event?.faqs) && event.faqs.length > 0) return event.faqs;
    if (Array.isArray(event?.questions) && event.questions.length > 0) return event.questions;
    return [];
  }, [event?.faqs, event?.questions]);

  const normalizedTerms = useMemo(() => {
    if (Array.isArray(event?.termsAndConditions) && event.termsAndConditions.length > 0) {
      return event.termsAndConditions;
    }
    if (event?.TC?.content) {
      return [event.TC];
    }
    return [];
  }, [event?.termsAndConditions, event?.TC]);

  const showFaqTc = useMemo(() => {
    const hasFaq = normalizedFaqs.length > 0;
    const hasTerms = normalizedTerms.length > 0;
    return hasFaq || hasTerms;
  }, [normalizedFaqs, normalizedTerms]);

  const artistsCount = Array.isArray(event?.artists) ? event.artists.length : 0;
  const showArtistsTab = artistsCount > 1;

  const visibleTabs = useMemo(() => {
    const base = ["about", "gallery", "location", "organizer"];
    if (showArtistsTab) base.push("artists");
    return base;
  }, [showArtistsTab]);

  const rotatingTabs = useMemo(() => {
    return visibleTabs;
  }, [visibleTabs]);

  useEffect(() => {
    if (visibleTabs.length === 0) return;
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    if (rotatingTabs.length <= 1) return undefined;
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const idx = rotatingTabs.indexOf(prev);
        const next = rotatingTabs[(idx + 1) % rotatingTabs.length];
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [rotatingTabs]);

  const tabAnimationStyle = useMemo(() => ({ animation: "tabFadeSlide 0.6s ease" }), []);
  const pageCss = useMemo(
    () =>
      `
      @keyframes tabFadeSlide {0%{opacity:0;transform:translateY(10px);}100%{opacity:1;transform:translateY(0);}}
      @keyframes sponsorMarquee {0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
      `,
    []
  );

  const renderTermsContent = () => {
    if (event?.termsHtml) {
      return (
        <div
          className="prose prose-invert max-w-none text-white/85 prose-p:my-2 prose-li:my-1 prose-ol:list-decimal prose-ul:list-disc prose-headings:text-white"
          dangerouslySetInnerHTML={{ __html: event.termsHtml }}
        />
      );
    }

    const termsLines = event?.terms
      ?.split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (termsLines?.length) {
      return (
        <ul className="space-y-2 pl-5 list-disc text-white/85 text-sm leading-relaxed">
          {termsLines.map((line, idx) => (
            <li key={`term-line-${idx}`}>{line}</li>
          ))}
        </ul>
      );
    }

    return <p className="text-white/60 text-sm">No terms provided.</p>;
  };

  const renderFaqTc = () => (
    <div className="space-y-4">
      {normalizedFaqs.length > 0 && (
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_14px_50px_rgba(0,0,0,0.4)] overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-2 text-left px-5 py-4 hover:bg-white/[0.05] transition"
            onClick={() => setFaqOpen((prev) => !prev)}
          >
            <span className="flex items-center gap-2 text-white font-semibold text-base tracking-wide">
              <Megaphone className="h-5 w-5 text-sky-300" />
              Frequently Asked Questions
            </span>
            <ChevronDown
              className={`h-5 w-5 text-white/70 transition-transform ${faqOpen ? "rotate-180" : ""}`}
            />
          </button>
          {faqOpen && (
            <div className="border-t border-white/10 divide-y divide-white/5">
              {normalizedFaqs.map((qa, idx) => (
                <div key={`faq-${idx}`} className="px-5 py-4">
                  <p className="text-white font-semibold text-sm md:text-base mb-1">{qa.question}</p>
                  {qa.answer ? (
                    <p className="text-white/80 text-sm leading-relaxed">{qa.answer}</p>
                  ) : (
                    <p className="text-white/50 text-xs">No answer provided.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden">
        <button
          className="w-full flex items-center justify-between gap-2 text-left px-5 py-4 hover:bg-white/[0.06] transition"
          onClick={() => setTcOpen((prev) => !prev)}
        >
          <span className="flex items-center gap-2 text-white font-semibold text-base tracking-wide">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            Terms & Conditions
          </span>
          <ChevronDown
            className={`h-5 w-5 text-white/70 transition-transform ${tcOpen ? "rotate-180" : ""}`}
          />
        </button>
        {tcOpen && (
          <div className="border-t border-white/10 px-5 py-4 bg-white/[0.015]">
            {normalizedTerms.length > 0 ? (
              normalizedTerms.map((t, idx) => (
                <div key={`term-${idx}`} className="mb-4 last:mb-0">
                  {t.content ? (
                    <div
                      className="prose prose-invert max-w-none text-white/85 prose-p:my-2 prose-li:my-1 prose-ol:list-decimal prose-ul:list-disc prose-headings:text-white"
                      dangerouslySetInnerHTML={{ __html: t.content }}
                    />
                  ) : (
                    renderTermsContent()
                  )}
                  {t.lastUpdated && (
                    <p className="text-[11px] text-white/50 mt-2">Last updated: {new Date(t.lastUpdated).toLocaleDateString()}</p>
                  )}
                </div>
              ))
            ) : (
              renderTermsContent()
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderFaqTcBlock = () => (
    <div className="mt-4 space-y-4" style={tabAnimationStyle}>
      {showFaqTc ? (
        renderFaqTc()
      ) : (
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_14px_45px_rgba(0,0,0,0.4)] p-5">
          <p className="text-sm text-white/60">No FAQs or terms provided for this event.</p>
        </div>
      )}
    </div>
  );

  const hasSponsors = useMemo(
    () => Array.isArray(event?.sponsors) && event.sponsors.length > 0 && (event?.isSponsored ?? true),
    [event?.isSponsored, event?.sponsors]
  );

  const sponsorsSorted = useMemo(() => {
    if (!hasSponsors) return [];
    return [...event.sponsors].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }, [event?.sponsors, hasSponsors]);

  const primarySponsor = useMemo(() => (hasSponsors ? sponsorsSorted[0] : null), [hasSponsors, sponsorsSorted]);
  const secondarySponsors = useMemo(
    () => (hasSponsors && sponsorsSorted.length > 1 ? sponsorsSorted.slice(1) : []),
    [hasSponsors, sponsorsSorted]
  );
  const showSponsorStrip = useMemo(
    () => hasSponsors && sponsorsSorted.length > 1,
    [hasSponsors, sponsorsSorted.length]
  );

  const getArtistImage = (artist) =>
    artist.image || artist.photo || artist.avatar || artist.profileImage || FALLBACK_IMAGE;

  const formatAdvisory = (raw) => {
    if (!raw) return null;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) {
      const items = raw
        .map((item) => {
          if (!item) return null;
          if (typeof item === "string") return item;
          if (typeof item === "object") {
            return Object.entries(item)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join(", ");
          }
          return String(item);
        })
        .filter(Boolean);
      return items.length ? items.join(", ") : null;
    }
    if (typeof raw === "object") {
      const items = Object.entries(raw)
        .filter(([, v]) => v !== false && v !== null && v !== undefined)
        .map(([k, v]) => (typeof v === "boolean" ? k : `${k}: ${v}`));
      return items.length ? items.join(", ") : null;
    }
    return String(raw);
  };

  const buildAdvisoryItems = (raw) => {
    if (!raw) return [];
    // Already an array of strings
    if (Array.isArray(raw) && raw.every((i) => typeof i === "string")) return raw.filter(Boolean);

    // Object with booleans/customAdvisories
    if (typeof raw === "object") {
      const list = [];
      Object.entries(raw).forEach(([key, val]) => {
        if (key === "customAdvisories" && Array.isArray(val)) {
          val.forEach((c) => c && list.push(c));
          return;
        }
        if (val === true) {
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .trim();
          list.push(label.charAt(0).toUpperCase() + label.slice(1));
        }
      });
      return list;
    }

    // Fallback to formatted string split by comma
    const formatted = formatAdvisory(raw);
    if (!formatted) return [];
    return formatted.split(",").map((i) => i.trim()).filter(Boolean);
  };

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
          maxPerUser:
            t.maxPerUser !== undefined && t.maxPerUser !== null
              ? Number(t.maxPerUser)
              : null,
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

    const advisoryItems = buildAdvisoryItems(data.advisory?.warnings || data.advisory || data.advisories);

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
      ageRestriction: data.TC?.ageRestriction || data.ageRestriction || data.age_limit || "Not specified",
      dresscode: data.dresscode || "Not specified",
      parking: data.parking || "Not specified",
      accessibility: data.accessibility || "Not specified",
      reviews: reviewsCount,
      advisory: formatAdvisory(data.advisory?.warnings || data.advisory || data.advisories),
      advisoryItems,
      terms: data.TC?.terms || data.terms || "",
      termsHtml: data.TC?.content || data.termsHtml || "",
      termsUpdated: data.TC?.lastUpdated || data.termsUpdated || "",
      reviewsList: Array.isArray(data.reviews)
        ? data.reviews.map((r) => ({
            user: r.user?.name || "Guest",
            rating: r.rating || 0,
            comment: r.comment || "",
            userName: r.user?.name || "Guest",
            avatar: r.user?.avatar,
            createdAt: r.createdAt,
          }))
        : [],
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

        // Use slug-first endpoint; fallback to main only if that fails
        try {
          raw = await tryFetch(`/api/event/slug/${encodeURIComponent(id)}`);
        } catch (errSlug) {
          console.warn("Slug fetch failed, falling back to id endpoint", errSlug);
        }

        if (!raw) {
          try {
            raw = await tryFetch(`/api/event/${encodeURIComponent(id)}`);
          } catch (errMain) {
            console.warn("Primary fetch failed", errMain);
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
    setTicketQuantities((prev) => {
      const ticket = event?.tickets?.find((t) => t.id === ticketId);
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + change);

      if (!ticket) return { ...prev, [ticketId]: next };

      const availabilityCap = ticket.available ?? Infinity;
      const perUserCap = ticket.maxPerUser ?? Infinity;
      const cap = Math.min(availabilityCap, perUserCap);
      const capped = Math.min(next, cap);

      return { ...prev, [ticketId]: capped };
    });
  };

  const totalTickets = useMemo(() => {
    return Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [ticketQuantities]);

  const totalAmount = useMemo(() => {
    if (!event) return 0;
    const tickets = Array.isArray(event.tickets) ? event.tickets : [];
    return tickets.reduce((sum, ticket) => {
      const qty = ticketQuantities[ticket.id] || 0;
      return sum + ticket.price * qty;
    }, 0);
  }, [ticketQuantities, event]);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return "—";
    return `₹${num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const getTicketCap = (ticket) => {
    if (!ticket) return Infinity;
    const availabilityCap = ticket.available ?? Infinity;
    const perUserCap = ticket.maxPerUser ?? Infinity;
    return Math.min(availabilityCap, perUserCap);
  };

  const isSalesClosed = useMemo(() => {
    const status = (event?.eventStatus || "").toUpperCase();
    const publish = (event?.publishStatus || "").toUpperCase();
    return ["COMPLETED", "CANCELLED"].includes(status) || publish === "DRAFT";
  }, [event?.eventStatus, event?.publishStatus]);

  const isSoldOut = useMemo(() => {
    if (!event?.tickets?.length) return false;
    return event.tickets.every((t) => (t.available || 0) === 0);
  }, [event?.tickets]);

  const bookingDisabledReason = useMemo(() => {
    if (isSalesClosed) return "Sales closed";
    if (isSoldOut) return "Sold out";
    return "";
  }, [isSalesClosed, isSoldOut]);

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

    const selectedTickets = event.tickets
      .map((ticket) => ({
        ...ticket,
        quantity: ticketQuantities[ticket.id] || 0,
      }))
      .filter((t) => t.quantity > 0);

    const profileRaw = sessionStorage.getItem("userProfile");
    const profile = profileRaw ? JSON.parse(profileRaw) : {};
    const user = {
      ...profile,
      ...sessionUser,
    };

    const userDetails = {
      fullName: user.fullName || user.name,
      email: user.email,
      phone: user.phone || user.contact,
      addressLine1: user.addressLine1 || user.address,
      addressLine2: user.addressLine2 || "",
      state: user.state,
      city: user.city,
      pincode: user.pincode,
    };

    const missingRequired =
      !userDetails.fullName || !userDetails.email || !userDetails.phone || !userDetails.addressLine1;
    if (missingRequired) {
      toast.error("Please complete your profile (name, email, phone, address) before booking.");
      return;
    }

    const payload = {
      eventId: event.id || event.eventId || id,
      tickets: selectedTickets.map((t) => ({ ticketId: t.id, quantity: t.quantity })),
      userDetails,
    };

    try {
      setBookingLoading(true);
      const res = await apiFetch("/api/booking/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const booking = res?.data || res;
      if (!booking?.success) {
        throw new Error(booking?.message || "Booking failed");
      }

      navigate(`/events/${id}/checkout`, {
        state: {
          eventSummary: {
            id,
            title: event.title || event.eventTitle || event.name || "Event",
            date: event.startDate,
            time: event.time,
            venue: event.venue,
            address: event.address,
            banner: event.flyerImage || event.coverImage || FALLBACK_IMAGE,
          },
          tickets: selectedTickets,
          bookingData: booking.data,
        },
      });
    } catch (err) {
      toast.error(err?.message || "Unable to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
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
      <style>{pageCss}</style>

      {/* Hero Section - compact split image/details */}
      <div className="relative overflow-hidden pt-4 md:pt-6">
        <div className="w-full relative px-3 md:px-6">
          <div className="grid lg:grid-cols-[0.65fr,0.35fr] gap-0 items-stretch">
            {/* Left: Hero Image full bleed */}
            <div className="relative overflow-hidden min-h-[520px] h-full rounded-none lg:rounded-none bg-[#0a0c18]">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="bg-black/55 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back
                </Button>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="bg-black/55 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md"
                  title="Share event"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                {event.subCategory && (
                  <Badge className="bg-[#D60024]/85 text-white border border-[#ff8da8]/40 px-3 py-1 rounded-full">
                    {event.subCategory}
                  </Badge>
                )}
                {event.category && (
                  <Badge className="bg-white/15 text-white border border-white/20 px-3 py-1 rounded-full">
                    {event.category}
                  </Badge>
                )}
                {primarySponsor && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/15 shadow-lg ml-auto">
                    <img
                      src={primarySponsor.logo || SPONSOR_PLACEHOLDER}
                      alt={primarySponsor.name}
                      className="h-10 w-10 object-contain rounded-full bg-white/10 p-1"
                    />
                    <span className="text-[11px] uppercase tracking-[0.15em] text-white/80">Powered by</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Compact Details */}
            <div className="relative bg-[linear-gradient(135deg,rgba(13,17,30,0.94),rgba(10,10,16,0.92))] backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.7)] p-7 md:p-10 space-y-7 rounded-none lg:rounded-none lg:border-l border-white/10 flex flex-col justify-center">
              <div className="space-y-4 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-[0_8px_24px_rgba(255,77,103,0.25)] text-white">{event.title}</h1>
                <div className="w-20 h-1 rounded-full bg-gradient-to-r from-[#D60024] via-[#ff4d67] to-[#5ba2ff] mx-auto lg:mx-0" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-[#5ba2ff]/35 bg-[#0f1a2e]/80 p-4 flex items-start gap-3 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
                  <Calendar className="h-10 w-10 text-[#5ba2ff] p-2 rounded-xl bg-[#0f1a2e] border border-[#5ba2ff]/35" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/55">Date & Time</p>
                    <p className="text-white font-semibold">{formatDate(event.startDate)}</p>
                    <p className="text-white/75 text-sm">{formatTime(event.startDate)}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#5ba2ff]/35 bg-[#0f1a2e]/80 p-4 flex items-start gap-3 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
                  <MapPin className="h-10 w-10 text-[#5ba2ff] p-2 rounded-xl bg-[#0f1a2e] border border-[#5ba2ff]/35" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/55">Venue</p>
                    <p className="text-white font-semibold">{event.venue}</p>
                    <p className="text-white/75 text-sm line-clamp-2">{event.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSponsorStrip && (
        <div className="relative isolate border-y border-white/10 bg-white text-slate-900 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-20 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative flex items-center gap-6">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.22em] text-slate-600 whitespace-nowrap">
              Our trusted company and partners
            </p>
            <div className="relative flex-1 overflow-hidden">
              <div className="flex items-center gap-10 min-w-max animate-[sponsorMarquee_18s_linear_infinite]">
                {[...sponsorsSorted, ...sponsorsSorted].map((s, idx) => (
                  <div
                    key={`${s.id || s.name || "sponsor"}-${idx}`}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white shadow-md ring-1 ring-slate-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={s.logo || SPONSOR_PLACEHOLDER}
                        alt={s.name || "Sponsor"}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="text-sm sm:text-base font-semibold whitespace-nowrap text-slate-800">
                      {s.name || "Sponsor"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-[rgba(100,200,255,0.2)]">
              {visibleTabs.map((tab) => (
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
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-[rgba(59,130,246,0.04)] rounded-xl">
                <CardContent className="p-6 md:p-8 space-y-6" style={tabAnimationStyle}>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                      <Info className="h-6 w-6 text-[#D60024]" />
                      About This Event
                    </h2>
                    <p className="text-[rgba(255,255,255,0.85)] leading-relaxed whitespace-pre-line">
                      {event.about}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Event Guide</h3>
                        <p className="text-sm text-white/70">Key advisories and notes for attendees</p>
                      </div>
                      {event.advisoryItems?.length > 3 && (
                        <button
                          className="text-sm font-semibold text-[#93c5fd] hover:text-white transition"
                          onClick={() => setAdvisoryModalOpen(true)}
                        >
                          See all 
                        </button>
                      )}
                    </div>

                    {event.advisoryItems?.length ? (
                      <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
                        {event.advisoryItems.slice(0, 4).map((item, idx) => (
                          <div
                            key={`advisory-preview-${idx}`}
                            className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-white/5 via-white/5 to-white/0 border border-white/10 backdrop-blur-sm hover:border-[#60a5fa]/40 hover:bg-white/10 transition shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex-shrink-0"
                          >
                            <div className="h-10 w-10 rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-center text-[#60a5fa]">
                              <AlertTriangle className="h-5 w-5 drop-shadow" />
                            </div>
                            <div className="text-white font-semibold text-sm whitespace-nowrap">{item}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">No advisories provided.</p>
                    )}
                  </div>

                  {event.organizerNote?.trim?.() && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#60a5fa]/30 bg-gradient-to-r from-[#0b172b]/85 via-[#0f223a]/85 to-[#0b172b]/70 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur">
                      <div className="h-12 w-12 rounded-xl bg-[#102541] border border-[#60a5fa]/40 flex items-center justify-center text-[#93c5fd]">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#c7d7ff]">Organizer Note</p>
                        <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
                          {event.organizerNote}
                        </p>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}
            {activeTab === "about" && artistsCount === 1 && event.artists?.length === 1 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_14px_50px_rgba(0,0,0,0.35)] p-5 md:p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Artist</h3>
                <div className="flex items-center gap-4">
                  <img
                    src={getArtistImage(event.artists[0])}
                    alt={event.artists[0].name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-white/10 shadow-lg"
                  />
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">{event.artists[0].name}</p>
                    {(event.artists[0].role || event.artists[0].genre || event.artists[0].gender) && (
                      <p className="text-sm text-white/70 capitalize">
                        {event.artists[0].role || event.artists[0].genre || event.artists[0].gender?.toLowerCase()}
                      </p>
                    )}
                    <div className="flex gap-3 text-xs font-medium">
                      {event.artists[0].instagramLink && (
                        <a
                          href={event.artists[0].instagramLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#93c5fd] hover:text-white"
                        >
                          Instagram
                        </a>
                      )}
                      {event.artists[0].spotifyLink && (
                        <a
                          href={event.artists[0].spotifyLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#22c55e] hover:text-white"
                        >
                          Spotify
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "about" && renderFaqTcBlock()}
            {/* Advisory Modal */}
            <Dialog open={advisoryModalOpen} onOpenChange={setAdvisoryModalOpen}>
              <DialogContent className="max-w-xl border-white/10 bg-[#0b1224]/95 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Event Guide</DialogTitle>
                  <DialogDescription className="text-white/70">
                    All advisories and notes for this event.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {event?.advisoryItems?.length ? (
                    event.advisoryItems.map((item, idx) => (
                      <div
                        key={`advisory-modal-${idx}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="h-10 w-10 rounded-lg bg-[#0f172a] border border-white/10 flex items-center justify-center text-[#60a5fa]">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="text-white font-medium text-sm">{item}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/60">No advisories provided.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Gallery Tab */}
            {activeTab === "gallery" && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6 md:p-8" style={tabAnimationStyle}>
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
            {activeTab === "gallery" && renderFaqTcBlock()}

            {/* Location Tab */}
            {activeTab === "location" && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6 md:p-8" style={tabAnimationStyle}>
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
            {activeTab === "location" && renderFaqTcBlock()}

            {/* Organizer Tab */}
            {activeTab === "organizer" && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6 md:p-8" style={tabAnimationStyle}>
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
            {activeTab === "organizer" && renderFaqTcBlock()}

            {activeTab === "artists" && event.artists?.length > 0 && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(30,41,59,0.7)] rounded-xl">
                <CardContent className="p-6 md:p-8 space-y-6" style={tabAnimationStyle}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-[#D60024]" />
                    <h2 className="text-2xl font-bold text-white">Lineup & Artists</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {event.artists.map((artist) => (
                      <div
                        key={artist.id || artist.name}
                        className="flex gap-4 items-center rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_45px_rgba(0,0,0,0.35)] hover:border-white/20 transition"
                      >
                        <img
                          src={getArtistImage(artist)}
                          alt={artist.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                        />
                        <div className="space-y-1">
                          <p className="text-white font-semibold text-base">{artist.name}</p>
                          {(artist.role || artist.genre || artist.gender) && (
                            <p className="text-xs text-white/60 capitalize">{artist.role || artist.genre || artist.gender?.toLowerCase()}</p>
                          )}
                          <div className="flex gap-3 text-xs font-medium">
                            {artist.instagramLink && (
                              <a
                                href={artist.instagramLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#93c5fd] hover:text-white"
                              >
                                Instagram
                              </a>
                            )}
                            {artist.spotifyLink && (
                              <a
                                href={artist.spotifyLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#22c55e] hover:text-white"
                              >
                                Spotify
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

            {/* Reviews */}
            {/* {event.reviewsList?.length > 0 && (
              <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Star className="h-6 w-6 text-[#fbbf24]" />
                    What attendees said
                  </h2>
                  <div className="space-y-3">
                    {event.reviewsList.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 rounded-lg bg-white/5 border border-[rgba(100,200,255,0.15)]"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={review.avatar || FALLBACK_IMAGE}
                            alt={review.userName}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <p className="text-white font-semibold">{review.userName}</p>
                            <p className="text-xs text-white/60">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="ml-auto text-sm text-amber-200 font-semibold">
                            {review.rating} ★
                          </span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )} */}
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
                    {event.tickets.map((ticket) => {
                      const cap = getTicketCap(ticket);
                      const qty = ticketQuantities[ticket.id] || 0;
                      return (
                      <div
                        key={ticket.id}
                        className={`p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)] ${
                          ticket.available === 0 ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{ticket.name}</h4>
                            <p className="text-xs text-[rgba(255,255,255,0.65)]">{ticket.description}</p>
                          </div>
                          <span className="text-lg font-bold text-[#D60024]">{formatCurrency(ticket.price)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-[rgba(255,255,255,0.65)] space-y-1">
                            <p>{ticket.available} available</p>
                            {Number.isFinite(cap) && cap < Infinity && (
                              <p className="text-[rgba(255,255,255,0.55)]">Max {cap} per user</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(ticket.id, -1)}
                              disabled={!qty || isSalesClosed || ticket.available === 0}
                              className="h-8 w-8 p-0 border-[rgba(100,200,255,0.3)]"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-white">
                              {qty}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(ticket.id, 1)}
                              disabled={isSalesClosed || ticket.available === 0 || qty >= cap}
                              className="h-8 w-8 p-0 border-[rgba(100,200,255,0.3)]"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {ticket.available === 0 && (
                          <p className="text-[rgba(255,255,255,0.6)] text-xs mt-2">Sold out</p>
                        )}
                        {ticket.available > 0 && Number.isFinite(cap) && cap < Infinity && qty >= cap && (
                          <p className="text-[rgba(255,255,255,0.6)] text-xs mt-2">
                            You’ve reached the max per-user limit.
                          </p>
                        )}
                      </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3 mb-4 p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.15)]">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[rgba(255,255,255,0.75)]">Tickets selected</span>
                      <span className="font-semibold text-white text-base">{totalTickets}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBookNow}
                    disabled={totalTickets === 0 || isSalesClosed || isSoldOut}
                    className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all text-base py-6"
                  >
                    <Ticket className="h-5 w-5 mr-2" />
                    {bookingDisabledReason || "Book Now"}
                  </Button>

                  <p className="text-xs text-center text-[rgba(255,255,255,0.5)] mt-4">
                    {bookingDisabledReason ? "Booking is unavailable for this event." : "Secure payment • Instant confirmation"}
                  </p>
                </CardContent>
              </Card>

              {/* Event Stats */}
              {/* <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl mt-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-[#fbbf24]" />
                      <span className="text-2xl font-bold text-white">{event.rating}</span>
                    </div>
                    <span className="text-sm text-[rgba(255,255,255,0.65)]">{event.reviews} reviews</span>
                  </div>
                  <div className="space-y-2 text-sm text-[rgba(255,255,255,0.8)]">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#22c55e]" />
                      <span>Trending in {event.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total revenue</span>
                      <span className="font-semibold">{formatCurrency(event.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tickets sold</span>
                      <span className="font-semibold">{event.ticketsSold ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confirmed bookings</span>
                      <span className="font-semibold">{event.confirmedBookings ?? event.attendees ?? "—"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
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
