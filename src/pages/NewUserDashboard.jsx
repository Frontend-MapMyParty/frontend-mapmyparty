import { useState, useEffect } from "react";
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
  X
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
import UserDashboardHeader from "@/components/UserDashboardHeader";
import Footer from "@/components/Footer";
import Dashboard from "@/components/dashboard/Dashboard";
import { fetchSession } from "@/utils/auth";

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
    // Call logout API to clear cookies on backend (if available)
    try {
      const { buildUrl } = await import("@/config/api");
      await fetch(buildUrl("auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // Continue even if logout API fails
      console.warn("Logout API call failed:", err);
    }
    
    // Clear all session data using centralized function
    const { clearSessionData, resetSessionCache } = await import("@/utils/auth");
    clearSessionData();
    resetSessionCache();
    
    // Redirect to home
    navigate("/");
  };

  const navItems = [
    { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Browse Events', icon: <MapPin className="h-5 w-5" />, path: '/dashboard/browse-events' },
    { name: 'My Bookings', icon: <Ticket className="h-5 w-5" />, path: '/dashboard/my-bookings' },
  ];

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] text-white">
      {/* Mobile Header */}
      <header className={`lg:hidden bg-gradient-to-r from-[rgba(0,0,0,0.7)] via-[rgba(59,130,246,0.15)] to-[rgba(214,0,36,0.1)] border-b border-[rgba(100,200,255,0.25)] fixed w-full z-40 p-3 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(100,180,255,0.3)] transition-all duration-500 ease-in-out ${isHeaderVisible ? 'top-0 opacity-100' : '-top-24 opacity-0'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-white">MapMyParty</Link>
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
                  onClick={handleLogout} 
                  className="text-red-600 focus:text-red-600 hover:bg-red-900 transition-all cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
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
              <Link to="/" className="font-bold text-xl text-white hover:text-[#60a5fa] transition-all duration-300 hover:scale-105">
                MapMyParty
              </Link>

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
                    onClick={handleLogout} 
                    className="text-[#FF5555] focus:text-[#FF5555] hover:bg-[rgba(255,0,0,0.1)] transition-all duration-300 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
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
