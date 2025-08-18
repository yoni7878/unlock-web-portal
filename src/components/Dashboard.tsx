
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
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const [searchUrl, setSearchUrl] = useState("");
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
      name: "Google",
      url: "https://google.com",
      icon: Search,
      category: "Search",
      color: "text-blue-400"
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
    // In a real proxy, this would route through the proxy service
    window.open(url, '_blank');
    toast({
      title: `Opening ${name}`,
      description: "Launching in new tab via proxy...",
    });
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUrl) {
      let url = searchUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      handleOpenSite(url, "Custom Site");
      setSearchUrl("");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">UnblockEd Portal</h1>
          <p className="text-muted-foreground mt-2">Access the web without limits</p>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Custom URL Search */}
        <Card className="portal-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Browse Any Website
          </h2>
          <form onSubmit={handleCustomSearch} className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter website URL (e.g., github.com)"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="flex-1 h-12"
            />
            <Button type="submit" className="portal-button">
              <ExternalLink className="w-5 h-5" />
            </Button>
          </form>
        </Card>

        {/* Popular Sites Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Popular Sites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSites.map((site) => {
              const IconComponent = site.icon;
              return (
                <div
                  key={site.name}
                  className="site-grid-item group"
                  onClick={() => handleOpenSite(site.url, site.name)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className={`w-8 h-8 ${site.color} group-hover:scale-110 transition-transform duration-200`} />
                    <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                      {site.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{site.name}</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Access {site.name} without restrictions
                  </p>
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">Open site</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-12 text-center">
          <Card className="portal-card p-4 inline-block">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Proxy Status: Connected</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
