import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageSquare, Send, Clock } from "lucide-react";

const contactChannels = [
  {
    title: "Email",
    value: "hello@mapmyparty.com",
    icon: Mail,
    desc: "We respond within 1 business day.",
  },
  {
    title: "Phone / WhatsApp",
    value: "+91 98765 43210",
    icon: Phone,
    desc: "Support hours: 9 AM – 9 PM IST",
  },
  {
    title: "HQ",
    value: "Koramangala, Bengaluru, India",
    icon: MapPin,
    desc: "Come say hi at our studio.",
  },
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05060b] via-[#0a0f1f] to-[#0b0f18] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(214,0,36,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(96,165,250,0.18),transparent_30%)]" />
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 relative">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Contact</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Talk to a real human. We’re here to help your event shine.
            </h1>
            <p className="text-lg text-white/80">
              Whether you’re hosting, attending, or partnering, our concierge support team responds fast and with care.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white">
                Chat with us
              </Button>
              <Button variant="outline" className="border-white/30 text-white">
                Book a call
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6">
        {contactChannels.map(({ title, value, icon: Icon, desc }) => (
          <Card key={title} className="bg-white/5 border-white/10 h-full">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D60024]/15 border border-[#D60024]/30 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#D60024]" />
                </div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-white/70 text-sm">{desc}</div>
                </div>
              </div>
              <div className="text-lg font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10 grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Clock className="h-4 w-4" />
              <span>Avg. response time: under 2 hours</span>
            </div>
            <h2 className="text-3xl font-bold">Send us a note</h2>
            <p className="text-white/75">
              Share a few details and we’ll follow up with exactly what you need—no bots, no fluff.
            </p>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#22c55e]" />
                Event setup & onboarding
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#22c55e]" />
                Ticketing, payouts, and refunds
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#22c55e]" />
                Partnerships & media
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/70">Full Name</label>
                  <Input placeholder="Your name" className="bg-black/40 border-white/15 text-white" />
                </div>
                <div>
                  <label className="text-sm text-white/70">Email</label>
                  <Input type="email" placeholder="you@example.com" className="bg-black/40 border-white/15 text-white" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/70">Phone</label>
                  <Input placeholder="+91" className="bg-black/40 border-white/15 text-white" />
                </div>
                <div>
                  <label className="text-sm text-white/70">Topic</label>
                  <Input placeholder="Ticketing, hosting, partnership..." className="bg-black/40 border-white/15 text-white" />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/70">Message</label>
                <Textarea
                  rows={4}
                  placeholder="Tell us a bit more so we can help fast."
                  className="bg-black/40 border-white/15 text-white"
                />
              </div>
              <Button className="w-full md:w-auto bg-gradient-to-r from-[#D60024] to-[#ff4d67] gap-2">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
              <p className="text-xs text-white/60">
                By submitting, you agree to our Terms and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
