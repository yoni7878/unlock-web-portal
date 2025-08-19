import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Shield, 
  Zap,
  Check,
  X
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface SettingsProps {
  onBack: () => void;
}

export const Settings = ({ onBack }: SettingsProps) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { 
      id: 'dark' as const, 
      name: 'Dark Mode', 
      description: 'Classic dark theme',
      colors: ['#1a1625', '#6d28d9', '#3b82f6']
    },
    { 
      id: 'blue' as const, 
      name: 'Ocean Blue', 
      description: 'Deep blue professional',
      colors: ['#0f172a', '#0ea5e9', '#06b6d4']
    },
    { 
      id: 'purple' as const, 
      name: 'Royal Purple', 
      description: 'Elegant purple theme',
      colors: ['#1e1b2e', '#8b5cf6', '#a855f7']
    },
    { 
      id: 'green' as const, 
      name: 'Matrix Green', 
      description: 'Hacker-style green',
      colors: ['#0f1419', '#10b981', '#34d399']
    },
    { 
      id: 'orange' as const, 
      name: 'Sunset Orange', 
      description: 'Warm orange glow',
      colors: ['#1c1917', '#f97316', '#fb923c']
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
            <SettingsIcon className="w-10 h-10" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">Customize your portal experience</p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Back
        </Button>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Theme Selection */}
        <Card className="portal-card p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            Theme Selection
          </h2>
          <p className="text-muted-foreground mb-6">Choose your preferred color scheme</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((themeOption) => (
              <div
                key={themeOption.id}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-[1.02] ${
                  theme === themeOption.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setTheme(themeOption.id)}
              >
                {theme === themeOption.id && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1">
                    {themeOption.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <h3 className="font-semibold">{themeOption.name}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {themeOption.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="portal-card p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Security & Privacy
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <h3 className="font-medium">Proxy Protection</h3>
                <p className="text-sm text-muted-foreground">All traffic routed through secure proxy</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <h3 className="font-medium">SSL Encryption</h3>
                <p className="text-sm text-muted-foreground">End-to-end encrypted connections</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Enabled
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <h3 className="font-medium">No Logs Policy</h3>
                <p className="text-sm text-muted-foreground">Your browsing data is not stored</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Enforced
              </Badge>
            </div>
          </div>
        </Card>

        {/* Performance Settings */}
        <Card className="portal-card p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">&lt;50ms</div>
              <div className="text-sm text-muted-foreground">Latency</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">256bit</div>
              <div className="text-sm text-muted-foreground">Encryption</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};