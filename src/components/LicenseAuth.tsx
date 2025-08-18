
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Key, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LicenseAuthProps {
  onAuthenticated: () => void;
}

export const LicenseAuth = ({ onAuthenticated }: LicenseAuthProps) => {
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Demo license keys - in real app, this would be server-side validation
  const validKeys = [
    "SCHOOL-2024-PREMIUM",
    "EDU-ACCESS-2024",
    "STUDENT-PORTAL-KEY",
    "UNBLOCK-PRO-2024"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (validKeys.includes(licenseKey.toUpperCase())) {
        toast({
          title: "Access Granted! 🎉",
          description: "Welcome to the UnblockEd Portal",
        });
        onAuthenticated();
      } else {
        toast({
          title: "Invalid License Key",
          description: "Please check your license key and try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="portal-card w-full max-w-md p-8 text-center">
        <div className="animate-float mb-8">
          <Shield className="w-16 h-16 mx-auto text-primary neon-text" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 gradient-text">
          UnblockEd Portal
        </h1>
        <p className="text-muted-foreground mb-8">
          Enter your license key to access unlimited content
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter license key..."
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="pl-10 h-12 text-center font-mono tracking-wider"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !licenseKey}
            className="portal-button w-full h-12 animate-pulse-glow"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5" />
                Unlock Portal
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Demo Keys:</p>
          <div className="space-y-1 text-xs font-mono">
            {validKeys.map(key => (
              <button
                key={key}
                onClick={() => setLicenseKey(key)}
                className="block w-full text-primary hover:text-primary/80 transition-colors"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
