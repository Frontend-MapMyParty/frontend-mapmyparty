import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
// Authentication handled by ProtectedRoute wrapper via UserDashboard
import {
  Search,
  Bell,
  Menu,
  Home,
  Calendar,
  Settings,
  LogOut,
  Ticket,
  MapPin,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User as UserIcon,
  PlusCircle,
  BarChart2,
  MessageSquare,
  HelpCircle,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiFetch } from "@/config/api";
import { toast } from "sonner";
import UserDashboardHeader from "@/components/UserDashboardHeader";
import Footer from "@/components/Footer";
import Dashboard from "@/components/dashboard/Dashboard";
import { fetchSession } from "@/utils/auth";
import logoSvg from '@/assets/MMP logo.svg';

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry",
  "Chandigarh","Andaman and Nicobar Islands","Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep"
];

const POPULAR_CITIES = [
  { name: "Mumbai", icon: "🏙️", landmark: "Gateway of India" },
  { name: "Delhi", icon: "🏛️", landmark: "India Gate" },
  { name: "Bengaluru", icon: "🌿", landmark: "Cubbon Park" },
  { name: "Hyderabad", icon: "🕌", landmark: "Charminar" },
  { name: "Chandigarh", icon: "🌸", landmark: "Rose Garden" },
  { name: "Ahmedabad", icon: "🧵", landmark: "Sabarmati" },
  { name: "Pune", icon: "🏰", landmark: "Shaniwar Wada" },
  { name: "Chennai", icon: "🌊", landmark: "Marina Beach" },
  { name: "Kolkata", icon: "🎡", landmark: "Howrah" },
  { name: "Kochi", icon: "🌴", landmark: "Backwaters" },
];

const getInitials = (name, email) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
};

const getStoredUserInfo = () => {
  let storedProfile = {};
  const profileRaw = sessionStorage.getItem("userProfile");
  try {
    storedProfile = profileRaw ? JSON.parse(profileRaw) : {};
  } catch (error) {
    console.warn("Failed to parse stored profile", error);
  }

  return {
    name: storedProfile.name || sessionStorage.getItem("userName") || "User",
    email: storedProfile.email || sessionStorage.getItem("userEmail") || "user@example.com",
    avatar: storedProfile.avatar || storedProfile.avatarUrl || sessionStorage.getItem("userAvatar") || null,
  };
};

const NewUserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState(() => getStoredUserInfo());
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [stateInput, setStateInput] = useState("");
  const [selectedState, setSelectedState] = useState(null);
  const [pendingState, setPendingState] = useState(null);
  const [locationEvents, setLocationEvents] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateUser = async () => {
      const fallback = getStoredUserInfo();
      try {
        const session = await fetchSession();
        if (!isMounted) return;

        const sessionUser = session?.user || session?.data?.user || null;
        if (sessionUser) {
          const updated = {
            name: sessionUser.name || fallback.name,
            email: sessionUser.email || fallback.email,
            avatar: sessionUser.avatar || sessionUser.avatarUrl || sessionUser.photo || fallback.avatar,
          };
          setUserInfo(updated);

          // Keep storage in sync for other components
          sessionStorage.setItem("userName", updated.name || "");
          sessionStorage.setItem("userEmail", updated.email || "");
          if (updated.avatar) {
            sessionStorage.setItem("userAvatar", updated.avatar);
          }
        } else {
          setUserInfo(fallback);
        }
      } catch (err) {
        console.warn("Could not hydrate user from session", err);
        setUserInfo(fallback);
      }
    };

    hydrateUser();

    const handleStorage = (event) => {
      if (!event || event.storageArea !== sessionStorage) return;
      if (["userName", "userEmail", "userProfile", "userAvatar"].includes(event.key)) {
        setUserInfo(getStoredUserInfo());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Note: Authentication is handled by ProtectedRoute wrapper (via UserDashboard)
  // Set loading to false immediately as ProtectedRoute handles auth
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filteredStates = useMemo(() => {
    const term = stateInput.trim().toLowerCase();
    if (!term) return INDIAN_STATES;
    return INDIAN_STATES.filter((s) => s.toLowerCase().includes(term));
  }, [stateInput]);

  const extractStateFromEvent = (event = {}) => {
    const candidates = [
      event.state,
      event.location,
      event.venue,
      event.venue?.state,
      event.venues?.[0]?.state,
      event.venues?.[0]?.city,
      event.city,
    ];
    return candidates.find((c) => typeof c === "string" && c.trim().length > 0) || "";
  };

  const isEventInState = (event, state) => {
    if (!state) return false;
    const target = state.toLowerCase();
    const candidate = extractStateFromEvent(event).toLowerCase();
    return candidate.includes(target);
  };

  const fetchEventsByState = async (state) => {
    if (!state) return;
    setLocationLoading(true);
    setLocationError(null);
    try {
      const apiKey = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            `${state}, India`
          )}&key=${apiKey}`
        );
        const geoJson = await geoRes.json();
        const loc = geoJson?.results?.[0]?.geometry?.location || null;
        setGeocodeResult(loc);
      } else {
        setGeocodeResult(null);
      }

      const response = await apiFetch("/api/event", {
        method: "GET",
      });
      const eventsData = response.data?.events || response.data || response;
      const list = Array.isArray(eventsData) ? eventsData : [];
      const filtered = list.filter((evt) => isEventInState(evt, state));
      setLocationEvents(filtered);
      setSelectedState(state);
      return filtered;
    } catch (err) {
      console.error("Failed to fetch events for state", err);
      setLocationError(err.message || "Failed to load events for this location");
      setLocationEvents([]);
      return [];
    } finally {
      setLocationLoading(false);
    }
  };

  const handleConfirmState = async () => {
    const state = pendingState || stateInput || selectedState;
    if (!state) return;
    const events = await fetchEventsByState(state);
    setSelectedState(state);
    setLocationPopoverOpen(false);
    const count = events?.length || 0;
    count === 0
      ? toast.info(`No events in ${state} yet.`)
      : toast.success(`${count} event${count === 1 ? "" : "s"} in ${state}`);
  };

  const getEventTitle = (event = {}) =>
    event.title || event.eventTitle || event.name || "Event";

  const getEventVenue = (event = {}) =>
    event.venue?.name ||
    event.venue ||
    event.location ||
    event.city ||
    event.venues?.[0]?.name ||
    "Venue TBA";

  // Scroll behavior for header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await apiFetch("auth/logout", { method: "POST" });
      toast.success("Logged out");
    } catch (err) {
      if (err?.status === 401) {
        // treat as already logged out
        console.warn("Logout 401: session already invalid/expired");
        toast("Session expired, logging out");
      } else {
        console.warn("Logout API call failed:", err);
        toast.error(err?.message || "Logout failed, clearing session");
      }
    } finally {
      try {
        const { clearSessionData, resetSessionCache } = await import("@/utils/auth");
        clearSessionData();
        resetSessionCache();
      } catch (e) {
        console.warn("Failed to clear session cache", e);
      }
      setIsLoggingOut(false);
      navigate("/");
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Browse Events', icon: <MapPin className="h-5 w-5" />, path: '/dashboard/browse-events' },
  ];

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] text-white">
      {/* Mobile Header */}
      <header className={`lg:hidden bg-gradient-to-r from-[rgba(0,0,0,0.7)] via-[rgba(59,130,246,0.15)] to-[rgba(214,0,36,0.1)] border-b border-[rgba(100,200,255,0.25)] fixed w-full z-40 p-3 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(100,180,255,0.3)] transition-all duration-500 ease-in-out ${isHeaderVisible ? 'top-0 opacity-100' : '-top-24 opacity-0'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white hover:opacity-80 transition-opacity">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg p-1.5 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[rgba(255,255,255,0.1)]">
              <img src={logoSvg} alt="MMP Logo" className="w-14 h-14 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span>MapMyParty</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-[rgba(59,130,246,0.15)] border border-[rgba(100,200,255,0.25)] rounded-full transition-all hover:scale-110"
            >
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#D60024] animate-pulse"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative h-9 w-9 rounded-full hover:bg-red-800 border border-red-700 transition-all hover:scale-110"
                >
                  <Avatar className="h-8 w-8 bg-[#000000] ring-1 ring-red-600">
                    <AvatarImage src={userInfo.avatar} />
                    <AvatarFallback className="bg-red-600 text-white font-bold text-xs">
                      {getInitials(userInfo.name, userInfo.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl border border-red-700 bg-red-900 text-white shadow-[0_22px_60px_-20px_rgba(100,0,0,0.2)] backdrop-blur-xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 rounded-lg bg-red-900 p-3 hover:bg-red-800 transition-all">
                    <Avatar className="h-10 w-10 bg-[#000000] ring-2 ring-red-600">
                      <AvatarImage src={userInfo.avatar} />
                      <AvatarFallback className="bg-red-600 text-white font-bold">
                        {getInitials(userInfo.name, userInfo.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-bold leading-none text-white">
                        {userInfo.name || "Your name"}
                      </p>
                      <p className="text-xs leading-none text-red-300">
                        {userInfo.email || "Add your email"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-red-700" />
                <DropdownMenuItem 
                  onClick={() => navigate("/dashboard/profile")} 
                  className="cursor-pointer hover:bg-red-800 transition-all"
                >
                  <UserIcon className="mr-2 h-4 w-4 text-red-600" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-red-700" />
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/bookings")}
                  className="cursor-pointer hover:bg-red-800 transition-all"
                >
                  <Ticket className="mr-2 h-4 w-4 text-red-600" />
                  My Bookings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-red-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 focus:text-red-600 hover:bg-red-900 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                  <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-red-700 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-red-800 text-white shadow-[0_8px_20px_-8px_rgba(100,0,0,0.4)]'
                    : 'text-red-300 hover:text-white hover:bg-red-900 border border-red-700 hover:border-red-600'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white shadow-[0_10px_30px_-10px_rgba(214,0,36,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(214,0,36,0.6)] transition-all duration-300 flex items-center justify-center"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {/* Main Content - Full Width */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ marginTop: '64px', height: 'calc(100vh - 64px)', background: 'linear-gradient(to bottom right, #000000, #0a0a0a, #050510)' }}>
          {/* Desktop Header with Navigation */}
          <header className={`hidden lg:flex items-center justify-between p-4 bg-gradient-to-r from-[rgba(0,0,0,0.75)] via-[rgba(59,130,246,0.2)] to-[rgba(214,0,36,0.15)] border-b border-[rgba(100,200,255,0.3)] fixed right-0 left-0 z-30 backdrop-blur-2xl shadow-[0_12px_48px_-12px_rgba(100,180,255,0.4)] transition-all duration-500 ease-in-out ${isHeaderVisible ? 'top-0 opacity-100' : '-top-32 opacity-0'}`}>
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 font-bold text-xl text-white hover:text-[#60a5fa] transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg p-1.5 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[rgba(255,255,255,0.1)]">
                  <img src={logoSvg} alt="MMP Logo" className="w-14 h-14 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <span>MapMyParty</span>
              </Link>

              {/* Location Selector */}
              <Dialog open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                <DialogTrigger asChild>
                  {/* <Button
                    variant="ghost"
                    className="h-11 px-4 rounded-full border border-[rgba(100,200,255,0.25)] bg-[rgba(59,130,246,0.08)] hover:bg-[rgba(59,130,246,0.16)] text-white flex items-center gap-2 shadow-sm hover:shadow-[0_10px_30px_-12px_rgba(96,165,250,0.6)]"
                  >
                    <MapPin className="h-4 w-4 text-[#60a5fa]" />
                    <span className="text-sm font-medium">
                      {selectedState || "Select location"}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.7)]">
                      India
                    </span>
                  </Button> */}
                </DialogTrigger>
                <DialogContent className="max-w-[900px] w-[92vw] md:w-[90vw] bg-[#0b0e16] border border-[rgba(100,200,255,0.2)] text-white shadow-[0_18px_48px_-22px_rgba(0,0,0,0.65)] rounded-2xl p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">Pick your spot</p>
                      <p className="text-sm text-[rgba(255,255,255,0.7)]">
                        India-only. Choose a city/state; we’ll set your location.
                      </p>
                    </div>
                    {locationLoading && <Loader2 className="h-5 w-5 animate-spin text-[#60a5fa]" />}
                  </div>

                  <Input
                    value={stateInput}
                    onChange={(e) => {
                      setStateInput(e.target.value);
                      setPendingState(null);
                    }}
                    placeholder="Search Indian states..."
                    className="bg-[rgba(255,255,255,0.06)] border-[rgba(100,200,255,0.18)] text-white placeholder:text-[rgba(255,255,255,0.5)] focus:ring-2 focus:ring-[#60a5fa] focus:border-[#60a5fa]"
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[rgba(255,255,255,0.78)]">Popular cities</p>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {POPULAR_CITIES.map((city) => {
                        const active = (pendingState || selectedState) === city.name;
                        return (
                          <button
                            key={city.name}
                            type="button"
                            onClick={() => {
                              setPendingState(city.name);
                              setStateInput(city.name);
                            }}
                            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-3 transition-all text-sm ${
                              active
                                ? "border border-[#D60024] bg-[rgba(214,0,36,0.14)] text-white shadow-[0_10px_28px_-12px_rgba(214,0,36,0.45)]"
                                : "border border-[rgba(100,200,255,0.15)] bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.9)] hover:border-[#60a5fa] hover:bg-[rgba(96,165,250,0.08)]"
                            }`}
                          >
                            <span className="text-xl leading-none">{city.icon}</span>
                            <span className="text-sm font-semibold">{city.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[rgba(255,255,255,0.78)]">All states</p>
                    <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                      {filteredStates.map((state) => {
                        const active = (pendingState || selectedState) === state;
                        return (
                          <button
                            key={state}
                            type="button"
                            onClick={() => {
                              setPendingState(state);
                              setStateInput(state);
                            }}
                            className={`flex items-center gap-2 rounded-full px-3.5 py-2.5 border transition-all text-xs ${
                              active
                                ? "border-[#D60024] bg-[rgba(214,0,36,0.14)] text-white"
                                : "border-[rgba(100,200,255,0.12)] bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.9)] hover:border-[#60a5fa] hover:bg-[rgba(96,165,250,0.08)]"
                            }`}
                          >
                            <MapPin className="h-3.5 w-3.5 text-[#60a5fa]" />
                            <span className="truncate">{state}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      className="border-[rgba(100,200,255,0.2)] text-white hover:border-[#60a5fa] hover:bg-[rgba(96,165,250,0.08)]"
                      type="button"
                      onClick={() => {
                        setPendingState(null);
                        setStateInput("");
                        setSelectedState(null);
                        setLocationEvents([]);
                        setGeocodeResult(null);
                        setLocationError(null);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmState}
                      disabled={locationLoading || (!pendingState && !stateInput && !selectedState)}
                      className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white hover:shadow-[0_12px_32px_-12px_rgba(214,0,36,0.6)] disabled:opacity-60"
                    >
                      {locationLoading ? "Loading..." : "Confirm location"}
                    </Button>
                  </div>

                  {locationError && (
                    <p className="text-xs text-[#fca5a5]">⚠️ {locationError}</p>
                  )}

                </DialogContent>
              </Dialog>

              {/* Navigation Items */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white shadow-[0_10px_25px_-8px_rgba(214,0,36,0.5)]'
                        : 'text-[rgba(255,255,255,0.75)] hover:text-white hover:bg-[rgba(59,130,246,0.15)] border border-[rgba(100,200,255,0.15)] hover:border-[#60a5fa]/50 hover:shadow-[0_8px_20px_-10px_rgba(100,180,255,0.2)]'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side - Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgba(100,200,255,0.7)]" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(100,200,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.6)] focus:ring-2 focus:ring-[#60a5fa] focus:border-[#60a5fa] rounded-full transition-all duration-300 hover:bg-[rgba(59,130,246,0.1)] hover:border-[rgba(100,200,255,0.3)]"
                />
              </div>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-white hover:bg-[rgba(59,130,246,0.15)] border border-[rgba(100,200,255,0.2)] rounded-full transition-all duration-300 hover:scale-110 hover:border-[#60a5fa]/60 hover:shadow-[0_8px_20px_-8px_rgba(100,180,255,0.3)]"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#D60024] animate-pulse"></span>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 px-2 rounded-full border border-[rgba(100,200,255,0.2)] bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(59,130,246,0.12)] hover:border-[#60a5fa]/60 shadow-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_-8px_rgba(100,180,255,0.3)]"
                  >
                    <Avatar className="h-8 w-8 bg-[#000000] ring-2 ring-[rgba(100,200,255,0.3)]">
                      <AvatarImage src={userInfo.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-[#D60024] to-[#ff4d67] text-white font-bold">
                        {getInitials(userInfo.name, userInfo.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden xl:inline-flex items-center text-sm font-medium text-white ml-2">
                      {userInfo.name || "Your name"}
                      <ChevronDown className="ml-1 h-4 w-4 text-[rgba(255,255,255,0.65)] group-hover:text-[#60a5fa] transition-colors" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 rounded-xl border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.1)] via-[rgba(59,130,246,0.08)] to-[rgba(214,0,36,0.05)] text-white shadow-[0_25px_70px_-15px_rgba(100,180,255,0.2)] backdrop-blur-xl"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-[rgba(255,255,255,0.1)] via-[rgba(59,130,246,0.08)] to-[rgba(214,0,36,0.05)] p-3 hover:from-[rgba(59,130,246,0.15)] hover:to-[rgba(214,0,36,0.08)] transition-all duration-300">
                      <Avatar className="h-10 w-10 bg-[#000000] ring-2 ring-[rgba(100,200,255,0.3)]">
                        <AvatarImage src={userInfo.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#D60024] to-[#ff4d67] text-white font-bold">
                          {getInitials(userInfo.name, userInfo.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-bold leading-none text-white">
                          {userInfo.name || "Your name"}
                        </p>
                        <p className="text-xs leading-none text-[rgba(255,255,255,0.6)]">
                          {userInfo.email || "Add your email"}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[rgba(100,200,255,0.15)]" />
                  <DropdownMenuItem 
                    onClick={() => navigate("/dashboard/profile")} 
                    className="cursor-pointer hover:bg-[rgba(59,130,246,0.15)] transition-all duration-300"
                  >
                    <UserIcon className="mr-2 h-4 w-4 text-[#60a5fa]" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[rgba(100,200,255,0.15)]" />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/bookings")}
                    className="cursor-pointer hover:bg-[rgba(59,130,246,0.15)] transition-all duration-300"
                  >
                    <Ticket className="mr-2 h-4 w-4 text-[#60a5fa]" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[rgba(100,200,255,0.15)]" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-[#FF5555] focus:text-[#FF5555] hover:bg-[rgba(255,0,0,0.1)] transition-all duration-300 cursor-pointer disabled:opacity-60"
                  >
                    {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

       
    </div>
  );
};

export default NewUserDashboard;
