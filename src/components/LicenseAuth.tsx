
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Key, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LicenseAuthProps {
  onAuthenticated: () => void;
}

export const LicenseAuth = ({ onAuthenticated }: LicenseAuthProps) => {
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a license key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if license key exists and is valid
      const { data, error } = await supabase
        .from('license_keys')
        .select('*')
        .eq('key', licenseKey.trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Invalid license key');
      }

      // Check if key is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('License key has expired');
      }

      // Update last used timestamp
      await supabase
        .from('license_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);

      toast({
        title: "Access Granted",
        description: "Welcome to the UnblockEd Portal!",
      });

      onAuthenticated();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast({
        title: "Access Denied",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
      
      <Card className="portal-card p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">UnblockEd Portal</h1>
          <p className="text-muted-foreground">Enter your license key to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter license key (e.g., XXXX-XXXX-XXXX-XXXX)"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              className="pl-12 h-12 text-center font-mono"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full portal-button h-12"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Access Portal"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Need a license key?</p>
              <p className="text-xs text-muted-foreground">
                Contact your administrator or visit{" "}
                <a href="/admin" className="text-primary hover:underline">
                  the admin panel
                </a>{" "}
                if you have administrative access.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
