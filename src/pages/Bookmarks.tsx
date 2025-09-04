import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Bookmark, 
  Plus, 
  Trash2, 
  ExternalLink,
  Globe,
  Star,
  Clock,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProxyViewer } from "@/components/ProxyViewer";

interface BookmarksProps {
  onBack?: () => void;
}

interface BookmarkItem {
  id: string;
  name: string;
  url: string;
  category: string;
  addedAt: Date;
  visits: number;
}

export const Bookmarks = ({ onBack }: BookmarksProps) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([
    {
      id: "1",
      name: "GitHub",
      url: "https://github.com",
      category: "Development",
      addedAt: new Date("2024-01-15"),
      visits: 23
    },
    {
      id: "2", 
      name: "Stack Overflow",
      url: "https://stackoverflow.com",
      category: "Development",
      addedAt: new Date("2024-01-10"),
      visits: 45
    },
    {
      id: "3",
      name: "Netflix",
      url: "https://netflix.com",
      category: "Entertainment",
      addedAt: new Date("2024-01-08"),
      visits: 12
    },
    {
      id: "4",
      name: "Khan Academy",
      url: "https://khanacademy.org",
      category: "Education",
      addedAt: new Date("2024-01-05"),
      visits: 8
    }
  ]);
  
  const [newBookmark, setNewBookmark] = useState({ name: "", url: "", category: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [proxyUrl, setProxyUrl] = useState("");
  const [showProxy, setShowProxy] = useState(false);
  const { toast } = useToast();

  const categories = ["All", ...Array.from(new Set(bookmarks.map(b => b.category)))];

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || bookmark.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddBookmark = () => {
    if (newBookmark.name && newBookmark.url) {
      const bookmark: BookmarkItem = {
        id: Date.now().toString(),
        name: newBookmark.name,
        url: newBookmark.url.startsWith('http') ? newBookmark.url : `https://${newBookmark.url}`,
        category: newBookmark.category || "General",
        addedAt: new Date(),
        visits: 0
      };
      setBookmarks([bookmark, ...bookmarks]);
      setNewBookmark({ name: "", url: "", category: "" });
      setShowAddForm(false);
      toast({
        title: "Bookmark Added",
        description: `${bookmark.name} has been saved to your bookmarks.`,
      });
    }
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
    toast({
      title: "Bookmark Removed",
      description: "The bookmark has been deleted.",
    });
  };

  const handleOpenBookmark = (bookmark: BookmarkItem) => {
    setBookmarks(bookmarks.map(b => 
      b.id === bookmark.id ? { ...b, visits: b.visits + 1 } : b
    ));
    setProxyUrl(bookmark.url);
    setShowProxy(true);
    toast({
      title: `Opening ${bookmark.name}`,
      description: "Loading via secure proxy...",
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
          <h1 className="hero-title animate-scale-in">My Bookmarks</h1>
          <p className="text-xl text-muted-foreground/90 font-medium">Quick access to your favorite sites</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="status-dot"></div>
            <span className="text-sm font-mono text-green-400">{bookmarks.length} Saved Sites</span>
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
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="portal-button flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Bookmark
            </Button>
          </div>
        </Card>

        {/* Add Bookmark Form */}
        {showAddForm && (
          <Card className="portal-card p-6 animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Bookmark
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Bookmark name"
                  value={newBookmark.name}
                  onChange={(e) => setNewBookmark({...newBookmark, name: e.target.value})}
                />
                <Input
                  placeholder="Website URL"
                  value={newBookmark.url}
                  onChange={(e) => setNewBookmark({...newBookmark, url: e.target.value})}
                />
                <Input
                  placeholder="Category (optional)"
                  value={newBookmark.category}
                  onChange={(e) => setNewBookmark({...newBookmark, category: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddBookmark} className="portal-button">
                  Save Bookmark
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Bookmarks Grid */}
        <div className="space-y-6">
          {filteredBookmarks.length === 0 ? (
            <Card className="portal-card p-12 text-center">
              <div className="space-y-4">
                <div className="inline-flex p-4 bg-muted/50 rounded-2xl">
                  <Bookmark className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No Bookmarks Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms" : "Add your first bookmark to get started"}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map((bookmark, index) => (
                <Card
                  key={bookmark.id}
                  className="portal-card p-6 interactive-card group animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleOpenBookmark(bookmark)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                          <Globe className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {bookmark.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {bookmark.url}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBookmark(bookmark.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary">{bookmark.category}</Badge>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {bookmark.addedAt.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {bookmark.visits} visits
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="font-semibold">Open site</span>
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};