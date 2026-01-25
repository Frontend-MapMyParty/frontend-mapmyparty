import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Users, TrendingUp, Eye, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/config/api";

// Transform API response to component format (outside component to avoid recreation)
const transformEvent = (event) => {
  const ticketStats = (event.tickets || []).reduce(
    (acc, ticket) => {
      acc.totalCapacity += ticket.totalQty || 0;
      acc.soldQty += ticket.soldQty || 0;
      return acc;
    },
    { totalCapacity: 0, soldQty: 0 }
  );

  const revenueEstimate = (event.tickets || []).reduce((acc, ticket) => {
    return acc + (ticket.soldQty || 0) * (ticket.price || 0);
  }, 0);

  return {
    id: event.id,
    title: event.title,
    organizer: event.organizer?.name || "Unknown Organizer",
    currentAttendees: ticketStats.soldQty,
    totalCapacity: ticketStats.totalCapacity,
    ticketsSoldToday: ticketStats.soldQty,
    revenueToday: revenueEstimate,
    status: event.eventStatus?.toLowerCase() || "live",
    category: event.category,
    subCategory: event.subCategory,
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.venues?.[0]?.name || "",
    city: event.venues?.[0]?.city || "",
    flyerImage: event.flyerImage || event.images?.[0]?.url,
  };
};

const PromoterLiveEvents = () => {
  const navigate = useNavigate();
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs to prevent duplicate calls
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  const fetchLiveEvents = useCallback(async (isManualRefresh = false) => {
    // Prevent duplicate simultaneous calls
    if (isFetchingRef.current) {
      console.log("[PromoterLiveEvents] Fetch already in progress, skipping...");
      return;
    }

    isFetchingRef.current = true;

    // Only show loading on initial load or manual refresh
    if (!hasFetchedRef.current || isManualRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await apiFetch("promoter/live-events?status=ONGOING");

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      const data = response.data || response;
      const events = data.events || [];

      setLiveEvents(events.map(transformEvent));
      hasFetchedRef.current = true;
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Error fetching live events:", err);
      setError(err.message || "Failed to load live events");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial fetch
    fetchLiveEvents();

    // Refresh every 30 seconds (background refresh)
    const interval = setInterval(() => {
      fetchLiveEvents(false);
    }, 30000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchLiveEvents]);

  const handleManualRefresh = useCallback(() => {
    fetchLiveEvents(true);
  }, [fetchLiveEvents]);

  if (loading && liveEvents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Live Events</h2>
            <p className="text-muted-foreground">Real-time tracking of ongoing events</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error && liveEvents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Live Events</h2>
            <p className="text-muted-foreground">Real-time tracking of ongoing events</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleManualRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Events</h2>
          <p className="text-muted-foreground">Real-time tracking of ongoing events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleManualRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="text-red-600 border-red-600">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            {liveEvents.length} Live Now
          </Badge>
        </div>
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
                    {event.venue && ` • ${event.venue}`}
                    {event.city && `, ${event.city}`}
                  </p>
                </div>
                <Button onClick={() => navigate(`/organizer/live/${event.id}`)}>
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
                    <p className="text-sm text-muted-foreground">Tickets Sold</p>
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
                      {event.totalCapacity > 0
                        ? Math.round((event.currentAttendees / event.totalCapacity) * 100)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">filled</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sold</p>
                    <p className="text-2xl font-bold">{event.ticketsSoldToday}</p>
                    <p className="text-xs text-muted-foreground">tickets</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Revenue</p>
                    <p className="text-2xl font-bold">
                      ₹{event.revenueToday.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">from ticket sales</p>
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
            <p className="text-sm text-muted-foreground mt-2">
              Events with status "ONGOING" will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromoterLiveEvents;
