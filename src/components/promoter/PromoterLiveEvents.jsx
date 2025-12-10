 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Users, TrendingUp, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PromoterLiveEvents = () => {
  const navigate = useNavigate();

  const liveEvents = [
    {
      id: "1",
      title: "Summer Music Festival 2024",
      organizer: "ABC Events",
      currentAttendees: 3842,
      totalCapacity: 5000,
      ticketsSoldToday: 245,
      revenueToday: 14700,
      status: "live",
    },
    {
      id: "2",
      title: "Tech Innovation Conference",
      organizer: "TechCorp",
      currentAttendees: 1456,
      totalCapacity: 2000,
      ticketsSoldToday: 89,
      revenueToday: 8900,
      status: "live",
    },
    {
      id: "3",
      title: "Food & Wine Festival",
      organizer: "Culinary Dreams",
      currentAttendees: 2834,
      totalCapacity: 4000,
      ticketsSoldToday: 156,
      revenueToday: 12480,
      status: "live",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Events</h2>
          <p className="text-muted-foreground">Real-time tracking of ongoing events</p>
        </div>
        <Badge variant="outline" className="text-red-600 border-red-600">
          <Activity className="w-3 h-3 mr-1 animate-pulse" />
          {liveEvents.length} Live Now
        </Badge>
      </div>

      <div className="grid gap-6">
        {liveEvents.map((event) => (
          <Card key={event.id} className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge className="bg-red-600">
                      <Activity className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Organized by {event.organizer}
                  </p>
                </div>
                <Button onClick={() => navigate(`/events/${event.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Attendees</p>
                    <p className="text-2xl font-bold">{event.currentAttendees}</p>
                    <p className="text-xs text-muted-foreground">
                      of {event.totalCapacity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="text-2xl font-bold">
                      {Math.round((event.currentAttendees / event.totalCapacity) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">filled</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sold Today</p>
                    <p className="text-2xl font-bold">{event.ticketsSoldToday}</p>
                    <p className="text-xs text-muted-foreground">tickets</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Today</p>
                    <p className="text-2xl font-bold">
                      ₹{event.revenueToday.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">today's sales</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {liveEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No live events at the moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromoterLiveEvents;
