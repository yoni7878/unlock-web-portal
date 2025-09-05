import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Key, 
  Calendar,
  Users,
  Activity,
  Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuth } from "@/components/AdminAuth";
import { LicenseKeyManager } from "@/components/LicenseKeyManager";
import { UserManager } from "@/components/UserManager";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [licenseKeys, setLicenseKeys] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("licenses");
  const { toast } = useToast();

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load license keys
      const { data: keysData, error: keysError } = await supabase
        .from('license_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (keysError) throw keysError;
      setLicenseKeys(keysData || []);

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('license_users')
        .select('*')
        .order('last_used_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleUpdate = () => {
    loadData();
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full animate-float"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-accent/5 rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-secondary/5 rounded-full animate-pulse-glow"></div>
      </div>

      <div className="relative z-10 p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text flex items-center gap-3 animate-fade-in">
              <Shield className="w-10 h-10" />
              Admin Control Center
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive system management and analytics</p>
          </div>
          <Button
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
            className="flex items-center gap-2 hover-scale"
          >
            <Shield className="w-4 h-4" />
            Logout
          </Button>
        </header>

        <div className="max-w-7xl mx-auto">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="portal-card p-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <Key className="w-8 h-8 text-primary animate-pulse-glow" />
                <div>
                  <p className="text-2xl font-bold">{licenseKeys.length}</p>
                  <p className="text-sm text-muted-foreground">Total Keys</p>
                </div>
              </div>
            </Card>
            
            <Card className="portal-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold">
                    {licenseKeys.filter(k => k.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Keys</p>
                </div>
              </div>
            </Card>
            
            <Card className="portal-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </Card>
            
            <Card className="portal-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
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
            
            <Card className="portal-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-3">
                <Server className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold">
                    {users.filter(u => !u.is_banned).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Admin Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="licenses" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                License Management
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="licenses" className="space-y-6">
              <LicenseKeyManager 
                licenseKeys={licenseKeys} 
                loading={loading}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManager 
                loading={loading}
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;