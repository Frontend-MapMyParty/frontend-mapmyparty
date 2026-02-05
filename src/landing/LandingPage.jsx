import { Link } from "react-router-dom";
import {
  ArrowRight,
  Search,
  MapPin,
  Zap,
  Edit3,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  PartyPopper,
  Star,
  Quote,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  MapPinIcon,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Mock event data for trending section
const trendingEvents = [
  {
    id: 1,
    title: "Neon Nights Festival",
    date: "Feb 15, 2026",
    venue: "Brooklyn Warehouse",
    price: "$49",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
  },
  {
    id: 2,
    title: "Techno Underground",
    date: "Feb 20, 2026",
    venue: "The Basement Club",
    price: "$35",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
  },
  {
    id: 3,
    title: "Rooftop Vibes",
    date: "Feb 25, 2026",
    venue: "Sky Lounge NYC",
    price: "$65",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
  },
  {
    id: 4,
    title: "Electric Dreams",
    date: "Mar 1, 2026",
    venue: "Metro Arena",
    price: "$55",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
  },
];

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCity, setSelectedCity] = useState("New York City");

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trendingEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trendingEvents.length) % trendingEvents.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0619] via-[#1f0e35] to-[#0f0619] text-white font-sans overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 6 + 4 + "px",
              height: Math.random() * 6 + 4 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background: `radial-gradient(circle, ${
                Math.random() > 0.5 ? "rgba(124, 58, 237, 0.4)" : "rgba(236, 72, 153, 0.4)"
              }, transparent)`,
              filter: "blur(2px)",
              animationDelay: Math.random() * 3 + "s",
              animationDuration: Math.random() * 4 + 3 + "s",
            }}
          />
        ))}
      </div>

      {/* Large Glowing Orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "3s" }} />

      {/* Header/Navbar */}
      <nav className="relative z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] transition-all duration-300">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                MapMyParty
              </span>
            </Link>

            {/* Center Menu Links - Desktop */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                className="text-white font-medium hover:text-pink-400 transition-colors relative group"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
              </Link>
              <Link
                to="/browse-events"
                className="text-gray-300 font-medium hover:text-pink-400 transition-colors relative group"
              >
                Browse Events
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
              </Link>
              <Link
                to="/auth"
                className="text-gray-300 font-medium hover:text-pink-400 transition-colors relative group"
              >
                Host Event
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
              </Link>
              <Link
                to="/about"
                className="text-gray-300 font-medium hover:text-pink-400 transition-colors relative group"
              >
                Pricing
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
              </Link>
              <Link
                to="/about"
                className="text-gray-300 font-medium hover:text-pink-400 transition-colors relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
              </Link>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 hover:text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transition-all duration-300"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="rounded-full px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_35px_rgba(236,72,153,0.8)] transition-all duration-300">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text and Search */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Discover. Book.{" "}
                <span className="block mt-2">Party.</span>
              </h1>
              <p className="text-2xl lg:text-3xl text-gray-300">
                Your City's Events,{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
                  One Map Away.
                </span>
              </p>
              <p className="text-gray-400 text-lg max-w-xl">
                Discover the hottest concerts, festivals, and nightlife experiences happening right now.
                Book tickets instantly and never miss out on the party.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events, artists or venues…"
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-sm cursor-pointer"
                  >
                    <option value="New York City" className="bg-gray-900">New York City</option>
                    <option value="Los Angeles" className="bg-gray-900">Los Angeles</option>
                    <option value="Chicago" className="bg-gray-900">Chicago</option>
                    <option value="Miami" className="bg-gray-900">Miami</option>
                  </select>
                </div>
                <Link to="/browse-events">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl px-8 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                    Search
                  </Button>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/browse-events" className="flex-1 sm:flex-initial">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-full px-8 py-6 text-lg font-semibold shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:shadow-[0_0_35px_rgba(124,58,237,0.8)] transition-all duration-300">
                    Browse Events
                  </Button>
                </Link>
                <Link to="/auth" className="flex-1 sm:flex-initial">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-semibold border-2 border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all duration-300"
                  >
                    <span className="mr-2">+</span> Host Your Event
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Phone Mockup */}
            <div className="relative hidden lg:block">
              {/* Floating Map Pins */}
              <div className="absolute -left-10 top-20 w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.6)] animate-bounce">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -right-5 top-40 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.6)] animate-bounce" style={{ animationDelay: "0.5s" }}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="absolute left-10 bottom-20 w-14 h-14 bg-gradient-to-br from-pink-600 to-purple-500 rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(236,72,153,0.6)] animate-bounce" style={{ animationDelay: "1s" }}>
                <MapPin className="w-7 h-7 text-white" />
              </div>

              {/* Phone Mockup */}
              <div className="relative mx-auto w-[280px] transform rotate-6 hover:rotate-3 transition-transform duration-500">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.5)] border-4 border-gray-700">
                  <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-[2.5rem] overflow-hidden aspect-[9/19] relative">
                    {/* Phone Screen Content */}
                    <div className="absolute inset-0 p-4 space-y-3">
                      <div className="h-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20" />
                      <div className="h-64 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl border border-white/20 backdrop-blur-xl relative overflow-hidden">
                        {/* Simulated Map */}
                        <div className="absolute top-4 left-4">
                          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.8)]">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-8 right-6">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.8)]">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,1)]">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 bg-gradient-to-r from-purple-600/40 to-pink-600/40 backdrop-blur-xl rounded-2xl border border-white/20 p-3 flex items-center gap-3">
                          <div className="w-16 h-16 bg-purple-500/50 rounded-xl" />
                          <div className="flex-1 space-y-1">
                            <div className="h-3 bg-white/30 rounded w-3/4" />
                            <div className="h-2 bg-white/20 rounded w-1/2" />
                          </div>
                        </div>
                        <div className="h-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why MapMyParty Section */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Why MapMyParty?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(124,58,237,0.5)] group-hover:shadow-[0_0_40px_rgba(124,58,237,0.8)] group-hover:scale-110 transition-all duration-300">
                <MapPinIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Map-Based Discovery</h3>
              <p className="text-gray-400 leading-relaxed">
                Explore events happening around you with our interactive map. Find the perfect party within walking distance or across the city.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(236,72,153,0.5)] group-hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] group-hover:scale-110 transition-all duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Ticket Booking</h3>
              <p className="text-gray-400 leading-relaxed">
                Secure your spot in seconds with our lightning-fast checkout. Digital tickets delivered instantly to your phone.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(147,51,234,0.5)] group-hover:shadow-[0_0_40px_rgba(147,51,234,0.8)] group-hover:scale-110 transition-all duration-300">
                <Edit3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">For Event Hosts</h3>
              <p className="text-gray-400 leading-relaxed">
                Create, manage, and promote your events with powerful tools. Real-time analytics and instant payouts included.
              </p>
            </div>
          </div>
        </section>

        {/* Trending This Week Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-2">Trending This Week</h2>
              <p className="text-gray-400 text-lg">The hottest events everyone's talking about</p>
            </div>
            <div className="hidden md:flex gap-3">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300 flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300 flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingEvents.map((event, index) => (
              <Link to="/browse-events" key={event.id}>
                <div
                  className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-pink-500/50 hover:shadow-[0_8px_40px_rgba(236,72,153,0.3)] transition-all duration-300 cursor-pointer"
                >
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-pink-400">{event.price}</span>
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-6 py-2 text-sm shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-20">
            How It Works
          </h2>
          <div className="relative max-w-5xl mx-auto">
            {/* Connector Lines */}
            <div className="hidden lg:block absolute top-16 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.6)]" />

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.6)] relative z-10">
                    <Search className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-2xl" />
                </div>
                <h3 className="text-2xl font-bold">Search Events</h3>
                <p className="text-gray-400 leading-relaxed">
                  Browse our map or search by location, artist, or venue to find your perfect night out.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-600 to-pink-700 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.6)] relative z-10">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-2xl" />
                </div>
                <h3 className="text-2xl font-bold">Choose Seats</h3>
                <p className="text-gray-400 leading-relaxed">
                  Select your preferred tickets, add extras, and checkout securely in just a few clicks.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(147,51,234,0.6)] relative z-10">
                    <PartyPopper className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
                </div>
                <h3 className="text-2xl font-bold">Get Ready to Party</h3>
                <p className="text-gray-400 leading-relaxed">
                  Receive instant confirmation, digital tickets, and real-time updates. Just show up and enjoy!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hosting CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 p-16 text-center shadow-[0_0_60px_rgba(236,72,153,0.4)]">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-white rounded-full animate-pulse"
                  style={{
                    left: Math.random() * 100 + "%",
                    top: Math.random() * 100 + "%",
                    animationDelay: Math.random() * 3 + "s",
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Hosting an Event?
              </h2>
              <p className="text-xl text-white/90">
                Join thousands of organizers who trust MapMyParty to sell tickets, manage events, and create unforgettable experiences.
              </p>
              <Link to="/auth">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-10 py-6 text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
                  Start Hosting
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonial Strip */}
        <section className="bg-black/30 backdrop-blur-xl border-y border-white/10 py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Quote className="w-16 h-16 mx-auto text-pink-400 opacity-50" />
              <blockquote className="text-2xl lg:text-3xl font-medium text-white leading-relaxed">
                "MapMyParty transformed how we sell tickets. The platform is intuitive, the payouts are instant,
                and our attendees love the seamless experience. It's a game-changer for event organizers!"
              </blockquote>
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-400">
                <span className="font-semibold text-white">Sarah Johnson</span> - Music Festival Organizer
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0d0620] border-t border-white/10 py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              {/* Column 1 - MapMyParty */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                  <span className="text-xl font-bold">MapMyParty</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your ultimate destination for discovering and booking the best events in your city.
                </p>
              </div>

              {/* Column 2 - For Users */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg">For Users</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link to="/browse-events" className="hover:text-pink-400 transition-colors">Browse Events</Link></li>
                  <li><Link to="/auth" className="hover:text-pink-400 transition-colors">My Tickets</Link></li>
                  <li><Link to="/auth" className="hover:text-pink-400 transition-colors">My Account</Link></li>
                  <li><Link to="/about" className="hover:text-pink-400 transition-colors">How It Works</Link></li>
                </ul>
              </div>

              {/* Column 3 - For Hosts */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg">For Hosts</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link to="/auth" className="hover:text-pink-400 transition-colors">Create Event</Link></li>
                  <li><Link to="/auth" className="hover:text-pink-400 transition-colors">Organizer Dashboard</Link></li>
                  <li><Link to="/about" className="hover:text-pink-400 transition-colors">Pricing</Link></li>
                  <li><Link to="/about" className="hover:text-pink-400 transition-colors">Resources</Link></li>
                </ul>
              </div>

              {/* Column 4 - Company */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link to="/about" className="hover:text-pink-400 transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-pink-400 transition-colors">Contact</Link></li>
                  <li><Link to="/policies" className="hover:text-pink-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/policies" className="hover:text-pink-400 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-pink-500/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 flex items-center justify-center"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-pink-500/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 flex items-center justify-center"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-pink-500/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 flex items-center justify-center"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-pink-500/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 flex items-center justify-center"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center text-gray-400 text-sm border-t border-white/10 pt-8">
              <p>&copy; 2026 MapMyParty. All rights reserved. Made with ❤️ for party lovers.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
