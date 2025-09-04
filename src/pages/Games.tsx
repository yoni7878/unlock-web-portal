import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProxyViewer } from "@/components/ProxyViewer";
import gameImage from "@/assets/images/IMG_4886.webp";

interface GamesProps {
  onBack?: () => void;
}

export const Games = ({ onBack }: GamesProps) => {
  const [proxyUrl, setProxyUrl] = useState("");
  const [showProxy, setShowProxy] = useState(false);
  const { toast } = useToast();

  const games = [
    {
      name: "EasyFun Games",
      url: "https://easyfun.gg",
      image: gameImage,
      description: "Collection of fun and easy games"
    }
  ];

  const handleGameClick = (url: string, name: string) => {
    setProxyUrl(url);
    setShowProxy(true);
    toast({
      title: `Loading ${name}`,
      description: "Opening game via secure proxy...",
    });
  };

  if (showProxy) {
    return (
      <ProxyViewer 
        initialUrl={proxyUrl} 
        onBack={() => setShowProxy(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <header className="flex items-center gap-6 mb-12 max-w-6xl mx-auto">
        {onBack && (
          <Button
            onClick={onBack}
            variant="secondary"
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <div className="space-y-2">
          <h1 className="hero-title animate-scale-in">Games Portal</h1>
          <p className="text-xl text-muted-foreground/90 font-medium">Play games without restrictions</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="status-dot"></div>
            <span className="text-sm font-mono text-green-400">Games Online</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Games Grid */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl animate-bounce-gentle">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Available Games</h2>
              <p className="text-muted-foreground">Click any game to start playing</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <div
                key={game.name}
                className="site-grid-item group animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleGameClick(game.url, game.name)}
              >
                <div className="mb-6 relative overflow-hidden rounded-2xl">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent group-hover:from-primary/20 transition-all duration-300" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="p-3 bg-secondary/50 backdrop-blur-sm rounded-xl group-hover:bg-primary/10 transition-colors duration-300">
                      <Gamepad2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">{game.name}</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 mb-6">
                  {game.description}
                </p>
                <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="font-semibold">Play now</span>
                  <Gamepad2 className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Footer */}
        <div className="text-center pt-8">
          <Card className="portal-card p-6 inline-block interactive-card">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <div className="text-left">
                <div className="font-semibold text-green-400">Game Status: Ready</div>
                <div className="text-xs text-muted-foreground font-mono">All systems operational</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};