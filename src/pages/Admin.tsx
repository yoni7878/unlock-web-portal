import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Key, 
  Calendar,
  Users,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuth } from "@/components/AdminAuth";
import { LicenseKeyManager } from "@/components/LicenseKeyManager";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [licenseKeys, setLicenseKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    loadLicenseKeys();
  };

  const loadLicenseKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('license_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLicenseKeys(data || []);
    } catch (error) {
      console.error('Error loading license keys:', error);
      toast({
        title: "Error",
        description: "Failed to load license keys",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleKeyUpdate = () => {
    loadLicenseKeys();
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
            <Shield className="w-10 h-10" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">Manage license keys and system settings</p>
        </div>
        <Button
          onClick={() => setIsAuthenticated(false)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Logout
        </Button>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="portal-card p-6">
            <div className="flex items-center gap-3">
              <Key className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{licenseKeys.length}</p>
                <p className="text-sm text-muted-foreground">Total Keys</p>
              </div>
            </div>
          </Card>
          
          <Card className="portal-card p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">
                  {licenseKeys.filter(k => k.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Keys</p>
              </div>
            </div>
          </Card>
          
          <Card className="portal-card p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold">
                  {licenseKeys.filter(k => k.expires_at && new Date(k.expires_at) < new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Expired Keys</p>
              </div>
            </div>
          </Card>
          
          <Card className="portal-card p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">
                  {licenseKeys.filter(k => !k.expires_at).length}
                </p>
                <p className="text-sm text-muted-foreground">Lifetime Keys</p>
              </div>
            </div>
          </Card>
        </div>

        {/* License Key Manager */}
        <LicenseKeyManager 
          licenseKeys={licenseKeys} 
          loading={loading}
          onUpdate={handleKeyUpdate}
        />
      </div>
    </div>
  );
};

export default Admin;