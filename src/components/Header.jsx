import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Menu, X, ChevronDown, User, Ticket, Settings, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { isAuthenticated as checkAuth } from "@/utils/auth";

const Header = ({ 
  isAuthenticated: isAuthenticatedProp = undefined, 
  userRole: userRoleProp = null, 
  onLogout,
  forceMainHeader = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedIsAuthenticated = useMemo(() => {
    if (typeof isAuthenticatedProp === "boolean") {
      return isAuthenticatedProp;
    }
    return checkAuth();
  }, [isAuthenticatedProp]);

  const resolvedUserRole = useMemo(() => {
    if (userRoleProp) {
      return userRoleProp;
    }
    const storedRole = sessionStorage.getItem("role") || sessionStorage.getItem("userType");
    return storedRole || null;
  }, [userRoleProp]);

  const normalizedRole = typeof resolvedUserRole === "string" ? resolvedUserRole.toLowerCase() : null;
  const isOrganizer = normalizedRole === "organizer";
  const isPromoter = normalizedRole === "promoter";
  const isAttendee = !isOrganizer && !isPromoter;

  const handleAuthClick = () => {
    navigate("/auth");
  };

  const handleLogout = () => {
    // Clear all session storage data
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userType");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("userProfile");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userPhone");

    // Call parent onLogout if provided
    if (onLogout) onLogout();

    // Redirect to home
    navigate("/");
  };

  const isDashboard = location.pathname.startsWith('/dashboard') || 
                     location.pathname.startsWith('/organizer') ||
                     location.pathname.startsWith('/promoter');

  // Don't show header on dashboard/organizer/promoter pages unless forced
  if (resolvedIsAuthenticated && isDashboard && !forceMainHeader) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Brand */}
        {/* Always show Map MyParty logo that links to home */}
        <Link to="/" className="flex items-center gap-3 font-bold text-xl group">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-red-600">Map MyParty</span>
        </Link>

        {/* Desktop Navigation - Show main nav for non-authenticated users or when forced */}
        {(!resolvedIsAuthenticated || forceMainHeader) && (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/events"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Browse Events
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>
        )}

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {resolvedIsAuthenticated ? (
            <>
              {isAttendee ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 hover:bg-accent/50 transition-colors">
                      <User className="h-4 w-4" />
                      Profile
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/my-bookings")}
                      className="cursor-pointer"
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      My Bookings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isPromoter ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 hover:bg-accent/50 transition-colors">
                      <User className="h-4 w-4" />
                      Profile
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => navigate("/promoter/profile")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/promoter/dashboard")}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/organizer/dashboard-v2")}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleAuthClick} className="hover:bg-accent/50 transition-colors">
                Login
              </Button>
              <Button variant="default" onClick={handleAuthClick} className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            {isAttendee && (
              <>
                <Link
                  to="/events"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Events
                </Link>
                <Link
                  to="/about"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </>
            )}

            {resolvedIsAuthenticated ? (
              <>
                {isAttendee ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/profile");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/my-bookings");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      My Bookings
                    </Button>
                  </>
                ) : isPromoter ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/promoter/profile");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/promoter/dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/organizer/dashboard-v2");
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Dashboard
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleAuthClick();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Login
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    handleAuthClick();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
