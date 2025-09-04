import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  History as HistoryIcon, 
  Globe, 
  Clock, 
  Calendar,
  Search,
  Trash2,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProxyViewer } from "@/components/ProxyViewer";

interface HistoryProps {
  onBack?: () => void;
}

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  visitTime: Date;
  duration: number; // in minutes
}

export const History = ({ onBack }: HistoryProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: "1",
      url: "https://github.com",
      title: "GitHub",
      visitTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      duration: 15
    },
    {
      id: "2",
      url: "https://stackoverflow.com",
      title: "Stack Overflow - Where Developers Learn",
      visitTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      duration: 25
    },
    {
      id: "3",
      url: "https://youtube.com",
      title: "YouTube",
      visitTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      duration: 45
    },
    {
      id: "4",
      url: "https://reddit.com",
      title: "Reddit - Dive into anything",
      visitTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      duration: 20
    },
    {
      id: "5",
      url: "https://discord.com",
      title: "Discord",
      visitTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      duration: 30
    },
    {
      id: "6",
      url: "https://netflix.com",
      title: "Netflix",
      visitTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      duration: 120
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("All");
  const [proxyUrl, setProxyUrl] = useState("");
  const [showProxy, setShowProxy] = useState(false);
  const { toast } = useToast();

  const timeRanges = [
    { label: "All Time", value: "All" },
    { label: "Today", value: "Today" },
    { label: "Yesterday", value: "Yesterday" },
    { label: "Last 7 Days", value: "Week" },
    { label: "Last 30 Days", value: "Month" }
  ];

  const getTimeRangeFilter = (range: string) => {
    const now = new Date();
    switch (range) {
      case "Today":
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return (date: Date) => date >= today;
      case "Yesterday":
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return (date: Date) => date >= yesterday && date < endYesterday;
      case "Week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return (date: Date) => date >= weekAgo;
      case "Month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return (date: Date) => date >= monthAgo;
      default:
        return () => true;
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTimeRange = getTimeRangeFilter(selectedTimeRange)(item.visitTime);
    return matchesSearch && matchesTimeRange;
  });

  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = item.visitTime.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleOpenFromHistory = (item: HistoryItem) => {
    setProxyUrl(item.url);
    setShowProxy(true);
    toast({
      title: `Opening ${item.title}`,
      description: "Loading from history via secure proxy...",
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "All browsing history has been deleted.",
    });
  };

  const handleDeleteItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "The history item has been deleted.",
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
          <h1 className="hero-title animate-scale-in">Browsing History</h1>
          <p className="text-xl text-muted-foreground/90 font-medium">Review your recent browsing activity</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="status-dot"></div>
            <span className="text-sm font-mono text-green-400">{history.length} Total Visits</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Controls */}
        <Card className="portal-card p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-md"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleClearHistory}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </Button>
          </div>
        </Card>

        {/* History Content */}
        {Object.keys(groupedHistory).length === 0 ? (
          <Card className="portal-card p-12 text-center">
            <div className="space-y-4">
              <div className="inline-flex p-4 bg-muted/50 rounded-2xl">
                <HistoryIcon className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No History Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Your browsing history will appear here"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory)
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, items]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">{date}</h3>
                    <Badge variant="secondary">{items.length} visits</Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    {items
                      .sort((a, b) => b.visitTime.getTime() - a.visitTime.getTime())
                      .map((item, index) => (
                        <Card
                          key={item.id}
                          className="portal-card p-4 interactive-card group animate-fade-in cursor-pointer"
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => handleOpenFromHistory(item)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Globe className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium group-hover:text-primary transition-colors truncate">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {item.url}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(item.visitTime)}
                                </div>
                                <Badge variant="outline">
                                  {formatDuration(item.duration)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <ExternalLink className="w-4 h-4" />
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id);
                                }}
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};