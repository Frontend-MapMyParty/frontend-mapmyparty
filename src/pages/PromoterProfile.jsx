import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  Edit,
  Building2,
  Award,
  BarChart3,
  Shield,
  Settings,
  Database,
  Server,
  Globe,
  CreditCard
} from "lucide-react";

const PromoterProfile = () => {
  const navigate = useNavigate();
  const [promoterData, setPromoterData] = useState({
    name: "Application Owner",
    email: "admin@mapmyparty.com",
    phone: "+1 (555) 123-4567",
    role: "Platform Administrator",
    location: "Headquarters",
    joinDate: "January 2023",
    // Platform Statistics
    totalEvents: 28,
    totalUsers: 1250,
    totalOrganizers: 45,
    totalAttendees: 8500,
    platformRevenue: 248560,
    activeEvents: 5,
    systemUptime: "99.9%",
    verified: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated userRole="promoter" />

      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/promoter/dashboard")}
            className="mb-6 hover:bg-accent/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Profile Header */}
          <Card className="mb-6 border-2 overflow-hidden">
            <div className="bg-black h-32 relative">
              <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/png?seed=Promoter" />
                  <AvatarFallback className="bg-red-600 text-white text-2xl">
                    {promoterData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-16 pb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-red-600">
                      {promoterData.name}
                    </h1>
                    {promoterData.verified && (
                      <Badge className="bg-red-600 text-white border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{promoterData.role}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {promoterData.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {promoterData.joinDate}
                    </div>
                  </div>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="md:col-span-1 space-y-6">
              {/* Contact Information */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-red-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <Mail className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{promoterData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <Phone className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{promoterData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-900/20">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800/30">
                      <Shield className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="font-medium">{promoterData.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-900/20">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800/30">
                      <Server className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">System Uptime</p>
                      <p className="font-medium">{promoterData.systemUptime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-black" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-900/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-sm font-medium">Platform Status</span>
                      </div>
                      <Badge className="bg-red-600 text-white">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-900/20">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-black" />
                        <span className="text-sm font-medium">Database</span>
                      </div>
                      <Badge className="bg-red-600 text-white">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-900/20">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-black" />
                        <span className="text-sm font-medium">API</span>
                      </div>
                      <Badge className="bg-red-600 text-white">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start hover:bg-accent/50">
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-accent/50">
                    <Database className="w-4 h-4 mr-2" />
                    Database Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-accent/50">
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Platform Statistics */}
            <div className="md:col-span-2 space-y-6">
              {/* Platform Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-black text-white">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Events</p>
                        <p className="text-2xl font-bold text-red-600">{promoterData.totalEvents}</p>
                        <p className="text-xs text-muted-foreground mt-1">{promoterData.activeEvents} active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-red-600 text-white">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Platform Revenue</p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{promoterData.platformRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">All transactions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-red-600 text-white">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Users</p>
                        <p className="text-2xl font-bold text-red-600">{promoterData.totalUsers.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">{promoterData.totalAttendees.toLocaleString()} attendees</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-black text-white">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Organizers</p>
                        <p className="text-2xl font-bold text-black">{promoterData.totalOrganizers}</p>
                        <p className="text-xs text-muted-foreground mt-1">Registered</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Activity */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Platform Activity
                  </CardTitle>
                  <CardDescription>Recent system activities and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Event Verified", event: "Summer Music Festival", date: "2 hours ago", type: "success" },
                      { action: "New Organizer", event: "TechCorp joined platform", date: "1 day ago", type: "info" },
                      { action: "System Update", event: "Platform maintenance completed", date: "2 days ago", type: "warning" },
                      { action: "User Registration", event: "150 new users registered", date: "3 days ago", type: "success" },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          activity.type === "success" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                          activity.type === "info" ? "bg-blue-100 dark:bg-blue-900/30" :
                          "bg-amber-100 dark:bg-amber-900/30"
                        }`}>
                          <Activity className={`w-4 h-4 ${
                            activity.type === "success" ? "text-emerald-600" :
                            activity.type === "info" ? "text-blue-600" :
                            "text-amber-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action} - {activity.event}</p>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PromoterProfile;

