 import { useNavigate } from "react-router-dom";
import { /* Users, */ Lock, Globe, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EventTypeSelection = () => {
  const navigate = useNavigate();

  const eventTypes = [
    /*
    {
      id: "guest-list",
      title: "Guest List Event",
      description:
        "Invite-only event with a curated guest list. Perfect for private gatherings and exclusive occasions.",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    */
    {
      id: "exclusive",
      title: "Exclusive Event",
      description: "Keep it premium and private with promotion only on MapMyParty.",
      icon: Lock,
      color: "text-accent",
      bgColor: "bg-accent/10",
      fee: "5% platform fee",
      highlights: [
        "Promote only on this platform",
        "Curated, high-intent audience",
      ],
      cta: "Select Exclusive",
    },
    {
      id: "non-exclusive",
      title: "Non-Exclusive Event",
      description: "Reach everywhere: list here and across other platforms.",
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      fee: "10% platform fee",
      highlights: [
        "Multi-platform promotion allowed",
        "Visibility-first, broad audience",
      ],
      cta: "Select Non-Exclusive",
    },
  ];

  const handleSelectType = (typeId) => {
    navigate(`/organizer/create-event?type=${typeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b14] via-[#0a1222] to-[#050910] text-white">
      <main className="py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="text-center space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Organizer Portal</p>
              <h1 className="text-4xl font-extrabold">Choose your event type</h1>
              <p className="text-white/75 text-lg max-w-2xl mx-auto">
                Decide where you’ll promote, then pick the format that fits.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {eventTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur shadow-lg shadow-black/30 hover:shadow-red-500/25 hover:-translate-y-1.5 hover:border-red-500/30 transition cursor-pointer"
                  onClick={() => handleSelectType(type.id)}
                >
                  <CardHeader className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-4 text-xs text-white/60">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/10 border border-white/10 text-white/80">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {type.id === "exclusive" ? "Platform-only" : "Multi-platform"}
                      </span>
                      <span className="rounded-full px-3 py-1 bg-white/5 border border-white/5 text-white/70">
                        {type.id === "exclusive" ? "Private focus" : "Public reach"}
                      </span>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 via-red-400/15 to-blue-500/20 border border-white/10 flex items-center justify-center mx-auto shadow-inner shadow-black/20">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-white">{type.title}</CardTitle>
                      <CardDescription className="text-sm text-white/75 px-6 leading-relaxed">
                        {type.description}
                      </CardDescription>
                    </div>
                    {type.highlights && (
                      <div className="grid gap-2 px-4">
                        {type.highlights.map((point) => (
                          <div
                            key={point}
                            className="flex items-center gap-2 text-sm text-white/80 bg-white/5 border border-white/5 rounded-lg px-3 py-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-red-400/80" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pb-4 px-4">
                    <div className="flex items-center justify-between text-xs text-white/70 mb-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400/80" />
                        Platform fee
                      </span>
                      <span className="rounded-full px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-100 font-semibold">
                        {type.fee}
                      </span>
                    </div>
                    <Button
                      className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md shadow-red-500/25 hover:shadow-red-500/35 group-hover:scale-[1.01] transition"
                      variant="ghost"
                    >
                      {type.cta || "Select"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventTypeSelection;
