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
import PromoterDashboardHeader from "@/components/PromoterDashboardHeader";
import Footer from "@/components/Footer";
import Dashboard from "@/components/dashboard/Dashboard";
import { fetchSession } from "@/utils/auth";
import logoSvg from '@/assets/MMP logo.svg';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
  "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu",
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
      <header className={`lg:hidden bg-[#111111] border-b border-[#1a1a1a] fixed w-full z-40 p-3 transition-all duration-300 ${isHeaderVisible ? 'top-0 opacity-100' : '-top-24 opacity-0'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-[#D60024] transition-colors">
            <img src={logoSvg} alt="MMP Logo" className="w-8 h-8 object-contain" />
            <span>MapMyParty</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-white"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#D60024]"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-lg hover:bg-[#1a1a1a] border border-[#2a2a2a]"
                >
                  <Avatar className="h-7 w-7 bg-[#2a2a2a]">
                    <AvatarImage src={userInfo.avatar} />
                    <AvatarFallback className="bg-[#D60024] text-white text-xs font-medium">
                      {getInitials(userInfo.name, userInfo.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg border border-[#2a2a2a] bg-[#111111] text-white"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3">
                    <Avatar className="h-9 w-9 bg-[#2a2a2a]">
                      <AvatarImage src={userInfo.avatar} />
                      <AvatarFallback className="bg-[#D60024] text-white font-medium">
                        {getInitials(userInfo.name, userInfo.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium text-white">
                        {userInfo.name || "Your name"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userInfo.email || "Add your email"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/profile")}
                  className="cursor-pointer hover:bg-[#1a1a1a]"
                >
                  <UserIcon className="mr-2 h-4 w-4 text-gray-400" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/bookings")}
                  className="cursor-pointer hover:bg-[#1a1a1a]"
                >
                  <Ticket className="mr-2 h-4 w-4 text-gray-400" />
                  My Bookings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-[#D60024] hover:bg-[#1a1a1a]"
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
          <div className="mt-3 pt-3 border-t border-[#2a2a2a] space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${location.pathname === item.path
                    ? 'bg-[#D60024] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
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
          <header className={`hidden lg:flex items-center justify-between px-6 py-3 bg-[#111111] border-b border-[#1a1a1a] fixed right-0 left-0 z-30 transition-all duration-300 ${isHeaderVisible ? 'top-0 opacity-100' : '-top-32 opacity-0'}`}>
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-[#D60024] transition-colors">
                <img src={logoSvg} alt="MMP Logo" className="w-8 h-8 object-contain" />
                <span>MapMyParty</span>
              </Link>

              {/* Navigation Items */}
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${location.pathname === item.path
                        ? 'bg-[#D60024] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                      }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side - Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex relative w-56">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder:text-gray-500 rounded-lg focus:ring-1 focus:ring-[#D60024] focus:border-[#D60024]"
                />
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#D60024]"></span>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 px-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                  >
                    <Avatar className="h-7 w-7 bg-[#2a2a2a]">
                      <AvatarImage src={userInfo.avatar} />
                      <AvatarFallback className="bg-[#D60024] text-white text-sm font-medium">
                        {getInitials(userInfo.name, userInfo.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden xl:inline-flex items-center text-sm font-medium text-white ml-2">
                      {userInfo.name || "Your name"}
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg border border-[#2a2a2a] bg-[#111111] text-white"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3">
                      <Avatar className="h-9 w-9 bg-[#2a2a2a]">
                        <AvatarImage src={userInfo.avatar} />
                        <AvatarFallback className="bg-[#D60024] text-white font-medium">
                          {getInitials(userInfo.name, userInfo.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium text-white">
                          {userInfo.name || "Your name"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userInfo.email || "Add your email"}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/profile")}
                    className="cursor-pointer hover:bg-[#1a1a1a]"
                  >
                    <UserIcon className="mr-2 h-4 w-4 text-gray-400" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/bookings")}
                    className="cursor-pointer hover:bg-[#1a1a1a]"
                  >
                    <Ticket className="mr-2 h-4 w-4 text-gray-400" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="cursor-pointer text-[#D60024] hover:bg-[#1a1a1a]"
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
