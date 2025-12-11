 import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromoterOverview from "@/components/promoter/PromoterOverview";
import PromoterEvents from "@/components/promoter/PromoterEvents";
import PromoterOrganizers from "@/components/promoter/PromoterOrganizers";
import PromoterAnalytics from "@/components/promoter/PromoterAnalytics";
import PromoterLiveEvents from "@/components/promoter/PromoterLiveEvents";
import PromoterTopPerformers from "@/components/promoter/PromoterTopPerformers";
import PromoterUsers from "@/components/promoter/PromoterUsers";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Authentication handled by ProtectedRoute wrapper

const PromoterDashboard = () => {
  const navigate = useNavigate();

  // Validate authentication on page load
  // Note: Authentication is handled by ProtectedRoute wrapper
  // No need for redundant auth check here

  // Log component mount for debugging
  useEffect(() => {
    console.log("%c[PAGE LOADED] PromoterDashboard.jsx", "color: #16a34a; font-weight: bold;");
  }, []);

  const handleTabChange = (tab) => {
    console.log(`%c[Tab Switch] PromoterDashboard -> ${tab}`, "color: #3b82f6;");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated userRole="promoter" />

      <main className="flex-1 py-12">
        <div className="container">
          {/* Tabs Section */}
          <Tabs
            defaultValue="overview"
            className="space-y-6"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-6 lg:w-auto animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              <TabsTrigger value="overview" className="transition-all duration-200 hover:scale-105">Overview</TabsTrigger>
              <TabsTrigger value="events" className="transition-all duration-200 hover:scale-105">Events</TabsTrigger>
              <TabsTrigger value="organizers" className="transition-all duration-200 hover:scale-105">Organizers</TabsTrigger>
              <TabsTrigger value="analytics" className="transition-all duration-200 hover:scale-105">Analytics</TabsTrigger>
              <TabsTrigger value="live" className="transition-all duration-200 hover:scale-105">Live Events</TabsTrigger>
              <TabsTrigger value="users" className="transition-all duration-200 hover:scale-105">Users</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <PromoterOverview />
              <PromoterTopPerformers />
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <PromoterEvents />
            </TabsContent>

            {/* Organizers Tab */}
            <TabsContent value="organizers" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <PromoterOrganizers />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <PromoterAnalytics />
            </TabsContent>

            {/* Live Events Tab */}
            <TabsContent value="live" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <PromoterLiveEvents />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <PromoterUsers />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PromoterDashboard;
