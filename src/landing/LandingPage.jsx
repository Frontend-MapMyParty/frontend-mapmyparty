import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarRange,
  MapPin,
  Music2,
  Sparkles,
  ShieldCheck,
  Clock3,
  PartyPopper,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import heroImage from "@/assets/hero-image.jpg";
import eventMusic from "@/assets/event-music.jpg";
import eventConference from "@/assets/event-conference.jpg";
import eventFood from "@/assets/event-food.jpg";

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

const highlights = [
  { label: "Live events", value: "12K+", icon: CalendarRange },
  { label: "Cities covered", value: "240+", icon: MapPin },
  { label: "Tickets issued", value: "3.2M", icon: TicketIcon },
];

const categories = [
  { name: "Concerts", icon: Music2, color: "from-fuchsia-500/20 to-orange-500/20" },
  { name: "Tech & Business", icon: Sparkles, color: "from-blue-500/20 to-cyan-500/20" },
  { name: "Food & Drinks", icon: PartyPopper, color: "from-amber-500/20 to-rose-500/20" },
  { name: "Workshops", icon: ShieldCheck, color: "from-emerald-500/20 to-lime-500/20" },
];

const steps = [
  { title: "Discover", desc: "Spot curated events that match your vibe instantly.", icon: Sparkles },
  { title: "Book", desc: "Secure seats with one-tap checkout and instant tickets.", icon: ShieldCheck },
  { title: "Enjoy", desc: "Get reminders, live updates, and seamless entry.", icon: Clock3 },
];

function TicketIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M3 9a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2" />
      <path d="M21 15a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2a2 2 0 0 0-2-2" />
      <path d="M12 17v-2" />
      <path d="M12 13v-2" />
      <path d="M12 9V7" />
    </svg>
  );
}

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <Header forceMainHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 opacity-70"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/85 to-primary/40" />
          <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-amber-400/30 blur-3xl" />

          <div className="relative container px-4 py-20 lg:py-28 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-slate-100">Your city’s hottest events</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Discover, Book, and Host{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 bg-clip-text text-transparent">
                  Unforgettable Events
                </span>
              </h1>
              <p className="text-lg text-slate-200/80 max-w-2xl">
                Map MyParty connects you to concerts, festivals, meetups, and experiences—curated for every mood.
                Lock tickets in seconds and enjoy real-time updates right up to showtime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/browse-events">
                  <Button size="lg" variant="hero" className="text-base px-7">
                    Browse Events
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-7 border-white/30 text-white hover:bg-white hover:text-slate-900"
                  >
                    Create an Event
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-6">
                {highlights.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur hover:border-amber-300/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white/10 p-2">
                        <Icon className="h-5 w-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{value}</div>
                        <div className="text-xs uppercase tracking-[0.08em] text-slate-300/70">{label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-blue-500/10 blur-2xl" />
              <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_25px_80px_-24px_rgba(0,0,0,0.55)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
                      <CalendarRange className="h-5 w-5 text-amber-200" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-200/70">Tonight</p>
                      <p className="font-semibold text-lg">Spotlight Events</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100 border border-emerald-300/30">
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  {featuredEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-amber-300/40 transition-colors"
                    >
                      <div
                        className="h-16 w-16 rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: `url(${event.image})` }}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-amber-200 flex items-center gap-2">
                          <PartyPopper className="h-4 w-4" />
                          {event.category}
                        </div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-slate-300/80 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="text-amber-200 hover:text-amber-900 hover:bg-amber-200">
                        <Link to={`/events`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="relative py-14 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.04),transparent_25%)]" />
          <div className="container relative px-4 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Discover</p>
                <h2 className="text-3xl font-bold">Pick your vibe</h2>
              </div>
              <Link to="/browse-events">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-slate-900">
                  View all events
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map(({ name, icon: Icon, color }) => (
                <Link key={name} to="/events" className="group">
                  <div
                    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_25px_80px_-24px_rgba(0,0,0,0.65)]`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-80 transition-opacity group-hover:opacity-100`} />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-slate-200/70">Category</p>
                        <p className="text-lg font-semibold">{name}</p>
                      </div>
                      <div className="rounded-xl bg-white/20 p-2 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="relative mt-6 flex items-center gap-2 text-sm text-slate-100/80">
                      Explore now
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="py-16 bg-slate-900/60">
          <div className="container px-4 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-amber-200/80">Curated</p>
                <h2 className="text-3xl font-bold">Featured events</h2>
                <p className="text-slate-300/80">Handpicked experiences trending near you.</p>
              </div>
              <Link to="/browse-events">
                <Button variant="accent" className="bg-amber-400 text-slate-900 hover:bg-amber-300">
                  Browse all
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

        {/* How it works */}
        <section className="py-16 bg-slate-950">
          <div className="container px-4">
            <div className="text-center mb-10 space-y-3">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Seamless</p>
              <h2 className="text-3xl font-bold">How Map MyParty works</h2>
              <p className="text-slate-300/80 max-w-2xl mx-auto">
                From discovery to entry, we keep every step delightful with live updates and secure check-ins.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map(({ title, desc, icon: Icon }, index) => (
                <div
                  key={title}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-white/0" />
                  <div className="relative flex items-center justify-between">
                    <div className="rounded-xl bg-amber-400/15 p-3 text-amber-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200/70">0{index + 1}</span>
                  </div>
                  <h3 className="relative mt-5 text-xl font-semibold">{title}</h3>
                  <p className="relative mt-2 text-slate-300/80">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-16 bg-gradient-to-br from-amber-400/10 via-rose-400/10 to-blue-400/10">
          <div className="container px-4 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.18em] text-amber-500">Trusted</p>
              <h2 className="text-3xl font-bold text-slate-900">
                Loved by organizers & attendees
              </h2>
              <p className="text-slate-800/80 max-w-2xl">
                Instant payouts, secure tickets, and live support keep events smooth. Join thousands who make every
                celebration unforgettable with Map MyParty.
              </p>
              <div className="flex flex-wrap gap-3 text-slate-900">
                <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm">
                  <Star className="h-4 w-4 text-amber-500" />
                  4.8/5 average satisfaction
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Verified organizers
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm">
                  <Clock3 className="h-4 w-4 text-blue-600" />
                  Real-time support
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-semibold">
                  M
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Organizer Story</p>
                  <p className="font-semibold text-lg text-slate-900">Neha, Indie Fest</p>
                </div>
              </div>
              <p className="mt-4 text-slate-800 leading-relaxed">
                “Ticketing used to be a headache. With Map MyParty, we sold out in days, scanned tickets on-site, and
                paid artists instantly. The live attendee updates kept our crew fully aligned.”
              </p>
              <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Verified payout
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  8K attendees
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-slate-950">
          <div className="container px-4 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <PartyPopper className="h-4 w-4 text-amber-300" />
              <span className="text-slate-200">Host or attend—your choice.</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready for your next{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 bg-clip-text text-transparent">
                unforgettable night?
              </span>
            </h2>
            <p className="text-slate-300/80 max-w-2xl mx-auto">
              Create events, sell tickets, and thrill your guests. Or jump in as an attendee and enjoy the city’s best
              experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="hero" className="text-base px-8">
                  Host an Event
                </Button>
              </Link>
              <Link to="/browse-events">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 border-white/30 text-white hover:bg-white hover:text-slate-900"
                >
                  Find Events
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default LandingPage;
