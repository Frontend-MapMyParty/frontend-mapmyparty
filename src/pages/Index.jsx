 import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import heroImage from "@/assets/hero-image.jpg";
import eventMusic from "@/assets/event-music.jpg";
import eventConference from "@/assets/event-conference.jpg";
import eventFood from "@/assets/event-food.jpg";

const Index = () => {
  const featuredEvents = [
    {
      id: "1",
      title: "Summer Music Festival 2024",
      date: "July 15, 2024",
      location: "Central Park, New York",
      image: eventMusic,
      category: "Music",
      attendees: 5000,
      price: "From $49",
    },
    {
      id: "2",
      title: "Tech Innovation Conference",
      date: "August 22, 2024",
      location: "Convention Center, San Francisco",
      image: eventConference,
      category: "Conference",
      attendees: 2000,
      price: "From $199",
    },
    {
      id: "3",
      title: "Food & Wine Tasting Festival",
      date: "September 10, 2024",
      location: "Riverside Park, Chicago",
      image: eventFood,
      category: "Food & Drink",
      attendees: 3500,
      price: "From $75",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header forceMainHeader={true} />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r  via-primary/80 to-primary/60" />

        <div className="container relative z-10 py-20 text-center text-primary-foreground">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-primary-foreground/90 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
            Find and book tickets to thousands of events happening near you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Link to="/events">
              <Button variant="hero" size="lg" className="text-lg px-8">
                Browse Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 bg-background/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose EventHub?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The most trusted platform for event discovery and management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Discovery</h3>
              <p className="text-muted-foreground">
                Find events that match your interests with our powerful search
                and filtering
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
              <p className="text-muted-foreground">
                Book tickets with confidence using our secure payment system
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Tickets</h3>
              <p className="text-muted-foreground">
                Get your tickets instantly via email and manage them on the go
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Featured Events
              </h2>
              <p className="text-muted-foreground text-lg">
                Don't miss out on these popular events
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline">
                View All Events
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Host Your Event?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of organizers using EventHub to create memorable
            experiences
          </p>
          <Link to="/auth">
            <Button variant="hero" size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
