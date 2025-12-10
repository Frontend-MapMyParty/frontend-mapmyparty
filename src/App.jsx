 import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Auth from "./pages/Auth";
import GoogleCallback from "./pages/GoogleCallback";
import UserDashboard from "./pages/NewUserDashboard";
import Dashboard from "./components/dashboard/Dashboard";
import BrowseEvents from "./components/dashboard/BrowseEvents";
import MyBookings from "./pages/MyBookings";
import UserProfile from "./components/dashboard/UserProfile";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import PromoterDashboard from "./pages/PromoterDashboard";
import PromoterEventDetail from "./pages/PromoterEventDetail";
import CreateEvent from "./pages/CreateEvent.jsx";
import EventTypeSelection from "./pages/EventTypeSelection";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import PromoterProfile from "./pages/PromoterProfile";
import OrganizerDashboardV2 from "./pages/OrganizerDashboardV2";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            
            {/* Protected User Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="browse-events" element={<BrowseEvents />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
            
            {/* Protected Organizer Routes */}
            <Route path="/organizer/dashboard" element={
              <ProtectedRoute requiredRole="organizer">
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/organizer/dashboard-v2" element={
              <ProtectedRoute requiredRole="organizer">
                <OrganizerDashboardV2 />
              </ProtectedRoute>
            } />
            <Route path="/organizer/select-event-type" element={
              <ProtectedRoute requiredRole="organizer">
                <EventTypeSelection />
              </ProtectedRoute>
            } />
            <Route path="/organizer/create-event" element={
              <ProtectedRoute requiredRole="organizer">
                <CreateEvent />
              </ProtectedRoute>
            } />
            
            {/* Protected Promoter Routes */}
            <Route path="/promoter/dashboard" element={
              <ProtectedRoute requiredRole="promoter">
                <PromoterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/promoter/event/:id" element={
              <ProtectedRoute requiredRole="promoter">
                <PromoterEventDetail />
              </ProtectedRoute>
            } />
            <Route path="/promoter/profile" element={
              <ProtectedRoute requiredRole="promoter">
                <PromoterProfile />
              </ProtectedRoute>
            } />
            
            {/* Protected Profile Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
