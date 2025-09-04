
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Globe, 
  Search, 
  Youtube, 
  Music, 
  Video, 
  MessageCircle,
  LogOut,
  ExternalLink,
  Star,
  Settings as SettingsIcon,
  Gamepad2,
  Info,
  Bookmark,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProxyViewer } from "./ProxyViewer";
import { Settings } from "./Settings";

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const [searchUrl, setSearchUrl] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [showProxy, setShowProxy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const popularSites = [
    {
      name: "TikTok",
      url: "https://tiktok.com",
      icon: Video,
      category: "Social",
      color: "text-pink-400"
    },
    {
      name: "YouTube",
      url: "https://youtube.com",
      icon: Youtube,
      category: "Video",
      color: "text-red-400"
    },
    {
      name: "DuckDuckGo",
      url: "https://duckduckgo.com",
      icon: Search,
      category: "Search",
      color: "text-orange-400"
    },
    {
      name: "Discord",
      url: "https://discord.com",
      icon: MessageCircle,
      category: "Chat",
      color: "text-indigo-400"
    },
    {
      name: "Spotify",
      url: "https://spotify.com",
      icon: Music,
      category: "Music",
      color: "text-green-400"
    },
    {
      name: "Reddit",
      url: "https://reddit.com",
      icon: Globe,
      category: "Social",
      color: "text-orange-400"
    }
  ];

  const handleOpenSite = (url: string, name: string) => {
    setProxyUrl(url);
    setShowProxy(true);
    toast({
      title: `Loading ${name}`,
      description: "Opening via secure proxy...",
    });
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUrl) {
      let url = searchUrl;
      
      // Check if it's a direct website URL or a search query
      const isUrl = searchUrl.includes('.') && !searchUrl.includes(' ');
      
      if (isUrl) {
        // Direct website navigation
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        setProxyUrl(url);
        toast({
          title: "Loading website",
          description: "Opening via secure proxy...",
        });
      } else {
        // Search query - use DuckDuckGo
        const searchQuery = encodeURIComponent(searchUrl);
        url = `https://duckduckgo.com/?q=${searchQuery}`;
        setProxyUrl(url);
        toast({
          title: "Searching DuckDuckGo",
          description: "Performing search via secure proxy...",
        });
      }
      
      setShowProxy(true);
      setSearchUrl("");
    }
  };

  if (showProxy) {
    return (
      <ProxyViewer 
        initialUrl={proxyUrl} 
        onBack={() => setShowProxy(false)} 
      />
    );
  }

  if (showSettings) {
    return (
      <Settings 
        onBack={() => setShowSettings(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <div className="space-y-2">
          <h1 className="hero-title animate-scale-in">UnblockEd Portal</h1>
          <p className="text-xl text-muted-foreground/90 font-medium">Access the web without limits</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="status-dot"></div>
            <span className="text-sm font-mono text-green-400">System Online</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => window.location.href = '/about'}
            variant="secondary"
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <Info className="w-4 h-4" />
            About
          </Button>
          <Button
            onClick={() => window.location.href = '/bookmarks'}
            variant="secondary"
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <Bookmark className="w-4 h-4" />
            Bookmarks
          </Button>
          <Button
            onClick={() => window.location.href = '/history'}
            variant="secondary"
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <History className="w-4 h-4" />
            History
          </Button>
          <Button
            onClick={() => window.location.href = '/games'}
            variant="secondary"
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <Gamepad2 className="w-4 h-4" />
            Games
          </Button>
          <Button
            onClick={() => setShowSettings(true)}
            variant="secondary"
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </Button>
          <Button
            onClick={onLogout}
            variant="destructive"
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Custom URL Search */}
        <Card className="portal-card p-8 interactive-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Browse Any Website</h2>
              <p className="text-muted-foreground">Enter a URL or search query to get started</p>
            </div>
          </div>
          <form onSubmit={handleCustomSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter website URL or search DuckDuckGo (e.g., github.com or 'cat videos')"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="flex-1 h-14 px-6 rounded-xl text-lg"
            />
            <Button type="submit" className="portal-button h-14 px-8">
              <ExternalLink className="w-5 h-5 mr-2" />
              Go
            </Button>
          </form>
        </Card>

        {/* Popular Sites Grid */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl animate-bounce-gentle">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Popular Sites</h2>
              <p className="text-muted-foreground">Quick access to your favorite destinations</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularSites.map((site, index) => {
              const IconComponent = site.icon;
              return (
                <div
                  key={site.name}
                  className="site-grid-item group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleOpenSite(site.url, site.name)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-secondary/50 rounded-2xl group-hover:bg-primary/10 transition-colors duration-300">
                      <IconComponent className={`w-8 h-8 ${site.color} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <span className="text-xs px-3 py-1.5 bg-secondary/80 rounded-full text-muted-foreground font-medium border border-border/40">
                      {site.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">{site.name}</h3>
                  <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 mb-6">
                    Access {site.name} without restrictions
                  </p>
                  <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="font-semibold">Open site</span>
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Footer */}
        <div className="text-center pt-8">
          <Card className="portal-card p-6 inline-block interactive-card">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <div className="text-left">
                <div className="font-semibold text-green-400">Proxy Status: Connected</div>
                <div className="text-xs text-muted-foreground font-mono">Secured connection established</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
