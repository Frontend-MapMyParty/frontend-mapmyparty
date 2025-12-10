 import { useNavigate } from "react-router-dom";
import { Users, Lock, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated userRole="organizer" />

      <main className="flex-1 py-12">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Event Type</h1>
            <p className="text-muted-foreground text-lg">
              Select the type of event you want to create
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {eventTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className="hover:shadow-elegant transition-all hover:-translate-y-1 cursor-pointer group"
                  onClick={() => handleSelectType(type.id)}
                >
                  <CardHeader>
                    <div
                      className={`w-16 h-16 rounded-lg ${type.bgColor} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-8 h-8 ${type.color}`} />
                    </div>
                    <CardTitle className="text-center text-xl">
                      {type.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center mb-6">
                      {type.description}
                    </CardDescription>
                    <Button className="w-full" variant="outline">
                      Select
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventTypeSelection;
