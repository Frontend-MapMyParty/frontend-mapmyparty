import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { isAuthenticated as checkAuth } from "@/utils/auth";
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
  HelpCircle
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

const NewUserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get user info from sessionStorage - MUST be before early return
  const userInfo = useMemo(() => {
    const name = sessionStorage.getItem("userName") || "User";
    const email = sessionStorage.getItem("userEmail") || "user@example.com";
    return { name, email };
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const checkUserAuth = async () => {
      const authStatus = checkAuth();
      const userType = sessionStorage.getItem("userType");
      
      // Redirect to login if not authenticated or not a user
      if (!authStatus || (userType && userType.toLowerCase() !== "user")) {
        navigate('/auth?redirect=' + encodeURIComponent(location.pathname));
        return;
      }
      
      setIsLoading(false);
    };

    checkUserAuth();
  }, [location.pathname, navigate]);

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

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userType");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userPhone");
    sessionStorage.removeItem("userProfile");
    
    // Redirect to home
    navigate("/");
  };

  const navItems = [
    { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Browse Events', icon: <MapPin className="h-5 w-5" />, path: '/dashboard/browse-events' },
    { name: 'My Bookings', icon: <Ticket className="h-5 w-5" />, path: '/dashboard/my-bookings' },
    { name: 'Profile', icon: <UserIcon className="h-5 w-5" />, path: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 fixed w-full top-0 z-40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="font-bold text-xl">MapMyParty</Link>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 bg-red-100">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-red-100 text-red-600 font-semibold">{getInitials(userInfo.name, userInfo.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{sessionStorage.getItem("userName") || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{sessionStorage.getItem("userEmail") || "user@example.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } fixed top-0 left-0 h-full z-30`}
        >
          <div className="flex h-16 items-center px-4 border-b">
            <Link to="/" className="flex items-center space-x-2 font-bold">
              <span className="text-xl"><span className="text-red-600">Map</span>MyParty</span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              ))}
              
            </nav>
          </div>
          
          <div className="mt-auto">
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/20" onClick={toggleMobileMenu}></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
              <div className="flex flex-col h-full">
                <div className="flex h-16 items-center justify-between px-4 border-b">
                  <span className="text-xl font-bold"><span className="text-red-600">Map</span>MyParty</span>
                  <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'bg-red-50 text-red-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  ))}
                  <div className="px-4 py-2">
                    <Separator className="my-2" />
                  </div>
                  <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    <PlusCircle className="h-5 w-5" />
                    <span className="ml-3">Create Event</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64" style={{ marginTop: '64px', height: 'calc(100vh - 64px)' }}>
          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between p-4 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-30">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search events, people..."
                  className="w-full pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
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
