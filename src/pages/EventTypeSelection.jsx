 import { useNavigate } from "react-router-dom";
import { Users, Lock, Globe, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EventTypeSelection = () => {
  const navigate = useNavigate();

  const eventTypes = [
    {
      id: "guest-list",
      title: "Guest List Event",
      description:
        "Invite-only event with a curated guest list. Perfect for private gatherings and exclusive occasions.",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: "exclusive",
      title: "Exclusive Event",
      description:
        "Premium event with limited access. High-end experience for a select audience.",
      icon: Lock,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      id: "non-exclusive",
      title: "Non-Exclusive Event",
      description:
        "Public event open to everyone. Perfect for community gatherings and public celebrations.",
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
  ];

  const handleSelectType = (typeId) => {
    navigate(`/organizer/create-event?type=${typeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] via-[#0c1426] to-[#0a0f1a] text-white">
      <main className="py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div />
          </div>

          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Organizer Portal</p>
            <h1 className="text-4xl font-extrabold">Choose your event type</h1>
            <p className="text-white/60 text-lg">Pick the format that best fits the experience you want to host.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {eventTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur shadow-lg shadow-black/30 hover:shadow-red-500/20 hover:-translate-y-1 transition cursor-pointer"
                  onClick={() => handleSelectType(type.id)}
                >
                  <CardHeader className="text-center space-y-4 pt-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 via-red-400/15 to-blue-500/20 border border-white/10 flex items-center justify-center mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-white">{type.title}</CardTitle>
                    <CardDescription className="text-sm text-white/70 px-4">{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6 px-6">
                    <Button
                      className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md shadow-red-500/20 hover:shadow-red-500/30"
                      variant="ghost"
                    >
                      Select
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
