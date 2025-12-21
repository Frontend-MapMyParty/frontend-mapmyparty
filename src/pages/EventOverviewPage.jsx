import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import overviewHero from "@/assets/overview-hero.png";
import overviewAbout from "@/assets/overview-about.jpg";
import expect1 from "@/assets/expect1.jpg";
import expect2 from "@/assets/expect2.jpg";
import expect3 from "@/assets/expect3.jpg";

const EventOverviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expectExpanded, setExpectExpanded] = useState([false, false, false]);

  useEffect(() => {
    // Use local dummy data for overview; no API calls required
    const dummyEvent = {
      id,
      title: "Step Into the Pulse; Where Music, Light & Energy Collide",
      description:
        "Lose yourself in a night of electrifying rhythms, neon vibes, and pure energy. Experience top DJs, immersive visuals, and a crowd that moves as one. The pulse is calling; are you ready?",
      cta: "Get Tickets Now",
    };

    setEvent(dummyEvent);
    setLoading(false);
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'Event',
        text: `Check out this event: ${event?.title}`,
        url: window.location.href.replace('/overview', ''),
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href.replace('/overview', ''));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1426] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6a63]"></div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1426] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-[#ff4f5c] blur-3xl opacity-40" />
        <div className="absolute left-12 top-40 h-64 w-64 rounded-full bg-[#f38b5d] blur-3xl opacity-30" />
      </div>

      <header className="relative z-10">
        <div className="container flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff5d6c] via-[#ff7c55] to-[#ff4f5c] shadow-lg shadow-[#ff5d6c]/30" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#ff6a63]">PulseFest</p>
                <p className="text-sm text-white/80">Event Overview</p>
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-wide text-[#ff6a63] md:flex">
            <a href="#hero" className="hover:text-white">Home</a>
            <a href="#about" className="hover:text-white">About Us</a>
            <a href="#tickets" className="hover:text-white">Tickets</a>
            <a href="#gallery" className="hover:text-white">Gallery</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/10"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>
            <Button
              className="hidden rounded-full bg-transparent px-5 font-semibold text-[#ff6a63] ring-1 ring-[#ff6a63] hover:bg-[#ff6a63] hover:text-white md:inline-flex"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              Contact
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section id="hero" className="container grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
          <div className="relative space-y-8">
            <div className="absolute -left-10 -top-12 hidden h-28 w-48 bg-white/8 backdrop-blur-lg md:block" />
            <div className="inline-block rounded-lg bg-white/8 px-5 py-4 backdrop-blur-lg ring-1 ring-white/10">
              <p className="max-w-xs text-sm leading-relaxed text-white/70">
                Every beat pulls you deeper into the electric moment.
                Dance, connect, and let your pulse sync with the sound of the night.
              </p>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-[1.05] text-white md:text-5xl lg:text-6xl">
                {event.title}
              </h1>
              <p className="max-w-2xl text-lg text-white/75">{event.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <Button
                size="lg"
                className="group rounded-full border-2 border-[#ff6a63] bg-transparent px-7 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#ff6a63]"
                onClick={() => navigate(`/event/${event.id}#tickets`)}
              >
                {event.cta}
                <ArrowRight className="ml-3 h-5 w-5 transition group-hover:translate-x-1" />
              </Button>
            </div>

            <div
              className="hidden h-28 w-48 items-center justify-center rounded-lg md:flex"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.25) 1px, transparent 0)",
                backgroundSize: "12px 12px",
              }}
            />
          </div>

          <div className="relative flex flex-col items-center gap-4 lg:items-end">
            <img
              src={overviewHero}
              alt="Event Hero"
              className="mx-auto w-full max-w-[520px]"
            />
          </div>
        </section>

        <section className="relative w-full py-4">
          <div className="absolute inset-0 bg-[#101a2e]/80" />
          <div className="container relative flex justify-end">
            <p className="max-w-xs text-right text-xs leading-relaxed text-white/75">
              Join the city's most electrifying night
              of sound and sensation.
              Lose control. Find your rhythm, and
              become part of the pulse.
            </p>
          </div>
        </section>

{/* //for more space */}
<section className="container pb-8 pt-2"></section> 

        <section className="w-full bg-white text-[#0b1426]">
          <div className="container flex flex-col items-center justify-between gap-6 py-6 md:flex-row">
            <p className="text-sm font-medium text-[#2a2a2a]">Our trusted company and partners</p>
            <div className="flex flex-wrap items-center gap-6 text-lg font-semibold uppercase">
              <span className="text-[#d600aa]">Brand One</span>
              <span className="text-[#1aa33c]">Brand Two</span>
              <span className="text-[#1a4fa3]">Brand Three</span>
              <span className="text-[#d60000]">Brand Four</span>
            </div>
          </div>
        </section>
        
{/* //for more space */}
<section className="container pb-8 pt-2"></section> 

        <section className="w-full bg-[#0b1426] text-white pb-10 pt-6">
          <div className="container px-0 space-y-4">
            <div className="flex flex-col gap-3 lg:items-end text-right px-10">
              <h3 className="text-3xl font-semibold text-[#f6cfc8]">About the Experience</h3>
              <p className="text-sm leading-relaxed text-white/80 max-w-3xl">
                This experience captures the perfect blend of energy, atmosphere, and emotion.
                From the moment you step in, the environment pulls you into its rhythm,
                setting a mood that feels immersive and unforgettable.
              </p>
              <div className="flex justify-end">
                <button className="text-xs uppercase tracking-wide text-white/70 hover:text-white inline-flex items-center gap-1">
                  Show more
                </button>
              </div>
            </div>
          </div>


          {/* //for more space */}
<section className="container pb-6 pt-4"></section> 

          <div className="w-full">
            <img
              src={overviewAbout}
              alt="About the experience"
              className="block w-full h-[220px] md:h-[280px] lg:h-[320px] object-cover"
            />
          </div>
        </section>

        <section className="w-full bg-[#0b1426] text-white pb-12 pt-8">
          <div className="container px-0 space-y-8">
            <div className="space-y-3 text-center md:text-left md:px-10">
              <h3 className="text-3xl font-semibold text-[#f6cfc8] uppercase tracking-[0.08em]">What to Expect</h3>
              <p className="text-sm leading-relaxed text-white/80 max-w-3xl">
                This experience captures the perfect blend of energy, atmosphere, and emotion. From the moment you step in,
                the environment pulls you into its rhythm, setting a mood that feels immersive and unforgettable.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 px-4 md:px-6">
              {[
                { img: expect1, title: "Headliners & DJs", desc: "International & local DJs across two stages." },
                { img: expect2, title: "Immersive Production", desc: "Light, lasers, and visuals that surround you." },
                { img: expect3, title: "VIP Zones or Exclusive Experiences", desc: "Premium lounges and curated vibes." },
              ].map((item, idx) => {
                const expanded = expectExpanded[idx];
                return (
                  <div key={item.title} className="relative flex flex-col">
                    <button
                      className="absolute right-6 top-6 z-20 rounded-full bg-[#f7b7b0] ring-2 ring-white/50 shadow-lg hover:scale-105 transition-transform"
                      style={{ width: "72px", height: "72px" }}
                      type="button"
                      aria-label={`More about ${item.title}`}
                      onClick={() =>
                        setExpectExpanded((prev) => {
                          const next = [...prev];
                          next[idx] = !next[idx];
                          return next;
                        })
                      }
                    />
                    <div
                      className="overflow-hidden rounded-[36px] bg-gradient-to-b from-[#1f2435] via-[#151c2e] to-[#0f1628] ring-1 ring-white/10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]"
                      style={{
                        WebkitMaskImage:
                          "radial-gradient(circle 40px at calc(100% - 48px) 48px, transparent 0 40px, black 40px 100%)",
                        maskImage:
                          "radial-gradient(circle 40px at calc(100% - 48px) 48px, transparent 0 40px, black 40px 100%)",
                      }}
                    >
                      {expanded && (
                        <div className="px-5 pt-5 text-center text-white">
                          <p className="text-base font-semibold mb-2">{item.desc}</p>
                        </div>
                      )}
                      <img
                        src={item.img}
                        alt={item.title}
                        className="h-[220px] w-full object-cover md:h-[240px]"
                      />
                      <div className="bg-[#f7e0dc]/85 backdrop-blur-sm px-6 py-5 text-center text-[#1a0f18]">
                        <p className="text-base font-semibold text-[#1f1a1d]">{item.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EventOverviewPage;
