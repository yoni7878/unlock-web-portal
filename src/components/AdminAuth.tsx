import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export const AdminAuth = ({ onAuthenticated }: AdminAuthProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const ADMIN_PASSWORD = "Yonatan";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate some loading time for security
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === ADMIN_PASSWORD) {
      toast({
        title: "Access Granted",
        description: "Welcome to the admin panel",
      });
      onAuthenticated();
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
      
      <Card className="portal-card p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Admin Access</h1>
          <p className="text-muted-foreground">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-12 h-12"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-full portal-button h-12"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Access Admin Panel"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Authorized personnel only
          </p>
        </div>
      </Card>
    </div>
  );
};