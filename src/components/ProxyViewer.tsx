import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  RotateCcw, 
  ExternalLink,
  Maximize
} from "lucide-react";

interface ProxyViewerProps {
  initialUrl?: string;
  onBack: () => void;
}

export const ProxyViewer = ({ initialUrl, onBack }: ProxyViewerProps) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl || "");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getProxiedUrl = (url: string) => {
    if (!url) return "";
    
    // Format URL
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    return `https://swategico.global.ssl.fastly.net/embed.html#${formattedUrl}`;
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // URL will be automatically updated through getProxiedUrl
  };

  const handleRefresh = () => {
    // Force iframe reload by updating key
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
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

  const proxiedUrl = getProxiedUrl(currentUrl);

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
              className="portal-button px-4"
            >
              Go
            </Button>
          </form>

          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              size="sm"
              title="Open in new tab"
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
        {proxiedUrl && (
          <Card className="portal-card p-0 overflow-hidden">
            <iframe
              src={proxiedUrl}
              className={`w-full border-0 ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'h-[600px]'}`}
              title="Proxied Website"
              style={{ backgroundColor: 'white' }}
            />
          </Card>
        )}
      </div>
    </div>
  );
};