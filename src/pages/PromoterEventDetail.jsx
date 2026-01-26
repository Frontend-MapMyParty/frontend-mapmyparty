 import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import eventMusic from "@/assets/event-music.jpg";
import eventConference from "@/assets/event-conference.jpg";
import eventFood from "@/assets/event-food.jpg";
import { useEvents } from "@/hooks/useEvents";

const PromoterEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, loading } = useEvents();

  const allEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    organizer: e.organizer?.name || "Event Organizer",
    date: e.date || e.startDate,
    time: e.time || "TBD",
    location: e.location || e.venue || "TBA",
    status: e.status || "published",
    category: e.category || "Event",
    ticketsSold: e.ticketsSold || 0,
    totalTickets: e.totalTickets || 0,
    revenue: e.revenue || 0,
    image: e.image || e.coverImage || eventMusic,
    description: e.description || "No description available.",
    views: e.views || 0,
    shares: e.shares || 0,
  }));

  const event = allEvents.find((e) => e.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/promoter/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const enrolledPercentage =
    event.totalTickets > 0
      ? Math.round((event.ticketsSold / event.totalTickets) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/promoter/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 md:h-96 overflow-hidden rounded-t-lg">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-3">{event.title}</h1>
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          variant={
                            event.status === "published" ? "default" : "secondary"
                          }
                        >
                          {event.status}
                        </Badge>
                        <Badge variant="outline">{event.category}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-foreground">{event.date}</p>
                        <p className="text-sm">{event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <p className="font-medium text-foreground">{event.location}</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h2 className="text-xl font-bold mb-3">Description</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organizer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{event.organizer}</h3>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Tickets Sold</span>
                    <span className="font-bold">
                      {event.ticketsSold} / {event.totalTickets}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${enrolledPercentage}%` }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Enrolled</span>
                  </div>
                  <span className="font-bold text-lg">{enrolledPercentage}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Total Revenue</span>
                  </div>
                  <span className="font-bold text-lg text-primary">
                    ₹{event.revenue.toLocaleString()}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Page Views</span>
                  </div>
                  <span className="font-bold">{event.views.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Shares</span>
                  </div>
                  <span className="font-bold">{event.shares.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">
                    {event.views > 0
                      ? ((event.ticketsSold / event.views) * 100).toFixed(2)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Avg. Ticket Price</span>
                  <span className="font-medium">
                    ₹
                    {event.ticketsSold > 0
                      ? Math.round(event.revenue / event.ticketsSold)
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Remaining Capacity</span>
                  <span className="font-medium">
                    {event.totalTickets - event.ticketsSold}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PromoterEventDetail;
