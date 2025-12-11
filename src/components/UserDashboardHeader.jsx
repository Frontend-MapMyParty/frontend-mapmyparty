import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Menu, X, ChevronDown, User, Ticket, LogOut, Search, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const UserDashboardHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Get user info from sessionStorage
  const userInfo = useMemo(() => {
    const name = sessionStorage.getItem("userName") || "User";
    const email = sessionStorage.getItem("userEmail") || "user@example.com";
    return { name, email };
  }, []);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = (searchText || "").trim();
    if (q.length > 0) {
      navigate(`/events?search=${encodeURIComponent(q)}`);
    } else {
      navigate("/events");
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span><span className="text-red-600">Map</span> MyParty</span>
        </Link>

        {/* Desktop Search and Profile */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl px-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search events, tickets, or activities..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </form>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full text-gray-600 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-3 h-10 rounded-full border border-gray-200 bg-white/80 hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback className="bg-red-100 text-red-600 text-sm font-medium">{getInitials(userInfo.name, userInfo.email)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-flex items-center text-sm font-medium text-gray-700">
                    {userInfo.name}
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium text-gray-900">{userInfo.name}</p>
                  <p className="text-xs text-gray-500">{userInfo.email}</p>
                </div>
                <DropdownMenuContent className="border-t" />
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" className="rounded-full text-gray-600 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full px-4 pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search events, tickets, or activities..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default UserDashboardHeader;