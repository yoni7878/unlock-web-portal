import { useState, useEffect } from "react";
import { AdminAuth } from "@/components/AdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LicenseKeyManager } from "@/components/LicenseKeyManager";
import { UserManager } from "@/components/UserManager";
import { SystemStats } from "@/components/SystemStats";
import { ActivityLogs } from "@/components/ActivityLogs";
import { ThemeSelector } from "@/components/ThemeSelector";
import { LogOut, Key, Users, Activity, Clock, Settings, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [licenseKeys, setLicenseKeys] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
        {/* Enhanced Navigation Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text flex items-center gap-3 animate-fade-in">
              <BarChart3 className="w-10 h-10" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive system management and analytics</p>
          </div>
          <Button
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
            className="flex items-center gap-2 hover-scale"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/30 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="licenses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Key className="w-4 h-4 mr-2" />
              Licenses
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <SystemStats loading={loading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityLogs loading={loading} />
              <div className="space-y-6">
                <Card className="portal-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Quick Stats Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{licenseKeys.length}</div>
                        <div className="text-sm text-muted-foreground">Total Keys</div>
                      </div>
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{licenseKeys.filter(k => k.is_active).length}</div>
                        <div className="text-sm text-muted-foreground">Active Keys</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="licenses" className="space-y-6 animate-fade-in">
            <LicenseKeyManager 
              licenseKeys={licenseKeys} 
              loading={loading} 
              onUpdate={handleUpdate} 
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6 animate-fade-in">
            <UserManager loading={loading} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6 animate-fade-in">
            <ActivityLogs loading={loading} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <ThemeSelector />
            <Card className="portal-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Additional system settings and configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;