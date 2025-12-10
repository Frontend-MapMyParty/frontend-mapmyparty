 import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, DollarSign, TrendingUp, Activity } from "lucide-react";

const PromoterOverview = () => {
  const stats = [
    {
      title: "Total Events",
      value: "28",
      change: "+12 this month",
      icon: Calendar,
      color: "text-blue-600",
      bgGradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Total Organizers",
      value: "45",
      change: "+8 this month",
      icon: Users,
      color: "text-purple-600",
      bgGradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Total Revenue",
      value: "₹2,48,560",
      change: "+24% from last month",
      icon: DollarSign,
      color: "text-emerald-600",
      bgGradient: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Live Events",
      value: "5",
      change: "Active now",
      icon: Activity,
      color: "text-rose-600",
      bgGradient: "from-rose-500 to-red-500",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-opacity-50 animate-in fade-in-0 slide-in-from-left-4 overflow-hidden group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 rounded-bl-full`} />
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold mb-2 bg-gradient-to-br ${stat.bgGradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PromoterOverview;
