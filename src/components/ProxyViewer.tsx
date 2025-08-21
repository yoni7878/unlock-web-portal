import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  RotateCcw, 
  ExternalLink,
  AlertTriangle,
  Loader2,
  Maximize
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProxyViewerProps {
  initialUrl?: string;
  onBack: () => void;
}

export const ProxyViewer = ({ initialUrl, onBack }: ProxyViewerProps) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const loadUrl = async (url: string) => {
    if (!url) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const { data, error: funcError } = await supabase.functions.invoke('proxy', {
        body: { url }
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setContent(data.content);
      toast({
        title: "Success",
        description: "Website loaded successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load website";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      loadUrl(initialUrl);
    }

    // Listen for navigation messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'navigate' && event.data.url) {
        setCurrentUrl(event.data.url);
        loadUrl(event.data.url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [initialUrl]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUrl(currentUrl);
  };

  const handleRefresh = () => {
    loadUrl(currentUrl);
  };

  const handleOpenInNewTab = () => {
    let url = currentUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'min-h-screen'}`}>
      {/* Navigation Bar */}
      <Card className="portal-card m-4 p-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
            <Input
              type="text"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="Enter website URL..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="portal-button px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Go"
              )}
            </Button>
          </form>

          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Content Area */}
      <div className="flex-1 mx-4 mb-4">
        {isLoading && (
          <Card className="portal-card p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading website...</p>
          </Card>
        )}

        {error && (
          <Card className="portal-card p-8 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Website</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleOpenInNewTab}>
                Open in New Tab
              </Button>
            </div>
          </Card>
        )}

        {content && !isLoading && !error && (
          <Card className="portal-card p-0 overflow-hidden">
            <iframe
              srcDoc={content}
              className={`w-full border-0 ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'h-[600px]'}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-navigation"
              title="Proxied Website"
              style={{ backgroundColor: 'white' }}
            />
          </Card>
        )}
      </div>
    </div>
  );
};