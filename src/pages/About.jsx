import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Sparkles, ShieldCheck, HeartHandshake, Star } from "lucide-react";

const highlights = [
  { title: "Cities covered", value: "120+", icon: MapPin },
  { title: "Events hosted", value: "48k", icon: Calendar },
  { title: "Happy guests", value: "6.2M", icon: Users },
  { title: "Avg. rating", value: "4.8 / 5", icon: Star },
];

const pillars = [
  {
    title: "Trusted experiences",
    desc: "Curated organizers, verified venues, and transparent pricing so every ticket feels premium.",
    icon: ShieldCheck,
  },
  {
    title: "Human-first support",
    desc: "Concierge-style assistance before, during, and after every event. Real people, real help.",
    icon: HeartHandshake,
  },
  {
    title: "Community-driven",
    desc: "Built for creators, artists, and fans to meet in moments that matter.",
    icon: Sparkles,
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05060b] via-[#0a0f1f] to-[#0b0f18] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(214,0,36,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(96,165,250,0.18),transparent_28%)]" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative">
          <Badge className="bg-white/10 text-white border border-white/20 mb-4">About Map MyParty</Badge>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                We’re reimagining how the world meets, celebrates, and discovers.
              </h1>
              <p className="text-lg text-white/80">
                Map MyParty makes it effortless to create, find, and experience unforgettable events. From intimate
                gigs to city-wide festivals, we connect organizers and guests with tools that feel delightful and fast.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white">Browse Events</Button>
                <Button variant="outline" className="border-white/30 text-white">
                  Host an Event
                </Button>
              </div>
            </div>
            <Card className="bg-white/5 border-white/10 backdrop-blur">
              <CardContent className="grid grid-cols-2 gap-4 p-6">
                {highlights.map(({ title, value, icon: Icon }) => (
                  <div key={title} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Icon className="h-4 w-4 text-[#D60024]" />
                      <span>{title}</span>
                    </div>
                    <div className="text-2xl font-bold">{value}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map(({ title, desc, icon: Icon }) => (
            <Card key={title} className="bg-white/5 border-white/10 hover:border-[#D60024]/60 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#D60024]/15 border border-[#D60024]/30 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#D60024]" />
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge className="bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/40">Our promise</Badge>
            <h2 className="text-3xl font-bold">Every event feels premium</h2>
            <p className="text-white/75">
              Lightning-fast checkout, transparent fees, curated recommendations, and a team that has your back—from
              the first click to the final encore.
            </p>
            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67]">Get Started</Button>
              <Button variant="outline" className="border-white/30 text-white">
                Talk to us
              </Button>
            </div>
          </div>
          <div className="space-y-3 text-sm text-white/75">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              “We moved our entire festival series to Map MyParty and saw 19% faster sell-outs. The guest experience is
              unmatched.”
              <div className="mt-3 text-white font-semibold">— Aanya Desai, Festival Director</div>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/10">
              “Check-ins are smoother, and refunds are transparent. It just works.”
              <div className="mt-3 text-white font-semibold">— Rohan Mehta, Venue Partner</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
