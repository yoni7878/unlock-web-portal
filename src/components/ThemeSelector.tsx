import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Check } from "lucide-react";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { 
      name: 'dark', 
      label: 'Dark', 
      preview: 'bg-gradient-to-r from-purple-500 to-blue-500',
      description: 'Classic dark theme with purple accents'
    },
    { 
      name: 'blue', 
      label: 'Ocean Blue', 
      preview: 'bg-gradient-to-r from-blue-400 to-cyan-400',
      description: 'Cool ocean-inspired blue tones'
    },
    { 
      name: 'purple', 
      label: 'Purple', 
      preview: 'bg-gradient-to-r from-purple-600 to-pink-600',
      description: 'Rich purple with pink highlights'
    },
    { 
      name: 'green', 
      label: 'Forest', 
      preview: 'bg-gradient-to-r from-green-500 to-emerald-500',
      description: 'Natural green forest theme'
    },
    { 
      name: 'orange', 
      label: 'Sunset', 
      preview: 'bg-gradient-to-r from-orange-500 to-red-500',
      description: 'Warm sunset orange tones'
    },
    { 
      name: 'red', 
      label: 'Crimson', 
      preview: 'bg-gradient-to-r from-red-500 to-rose-500',
      description: 'Bold crimson red theme'
    },
    { 
      name: 'pink', 
      label: 'Rose', 
      preview: 'bg-gradient-to-r from-pink-500 to-rose-400',
      description: 'Elegant rose pink theme'
    },
    { 
      name: 'cyan', 
      label: 'Aqua', 
      preview: 'bg-gradient-to-r from-cyan-400 to-teal-400',
      description: 'Fresh aqua cyan theme'
    },
    { 
      name: 'indigo', 
      label: 'Midnight', 
      preview: 'bg-gradient-to-r from-indigo-500 to-blue-600',
      description: 'Deep midnight indigo theme'
    }
  ] as const;

  return (
    <Card className="portal-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <div
              key={themeOption.name}
              className={`relative cursor-pointer group transition-all duration-300 ${
                theme === themeOption.name ? 'scale-105' : 'hover:scale-105'
              }`}
              onClick={() => setTheme(themeOption.name)}
            >
              <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                theme === themeOption.name 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 bg-card/50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{themeOption.label}</h4>
                  {theme === themeOption.name && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
                
                <div className={`h-12 rounded-md mb-3 ${themeOption.preview} shadow-lg`}></div>
                
                <p className="text-sm text-muted-foreground">{themeOption.description}</p>
                
                <div className="flex gap-1 mt-3">
                  <div className="w-3 h-3 rounded-full bg-background border border-border"></div>
                  <div className="w-3 h-3 rounded-full bg-card border border-border"></div>
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Current theme:</strong> {themes.find(t => t.name === theme)?.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click any theme above to apply it instantly. Your preference will be saved automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};