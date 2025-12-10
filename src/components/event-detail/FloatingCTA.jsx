 import { useState, useEffect } from "react";
import { ShoppingCart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingCTA = ({ onBookClick, onShareClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container py-4 bg-background/95 backdrop-blur-md border-t shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onShareClick}
            className="hover-scale"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="accent"
            size="lg"
            onClick={onBookClick}
            className="flex-1 sm:flex-none hover-scale shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Get Tickets Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCTA;
