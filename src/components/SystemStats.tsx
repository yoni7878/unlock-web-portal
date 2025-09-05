import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Cpu, HardDrive, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SystemStatsProps {
  loading?: boolean;
}

export const SystemStats = ({ loading }: SystemStatsProps) => {
  const [stats, setStats] = useState({
    activeConnections: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsed: 0,
    requestsPerMinute: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Simulate system stats - in a real app you'd fetch from monitoring APIs
        const { data: users } = await supabase.from('license_users').select('*');
        const activeUsers = users?.filter(user => {
          const lastUsed = new Date(user.last_used_at || '');
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          return lastUsed > fiveMinutesAgo;
        }).length || 0;

        setStats({
          activeConnections: activeUsers,
          cpuUsage: Math.floor(Math.random() * 40) + 10, // 10-50%
          memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
          storageUsed: Math.floor(Math.random() * 20) + 15, // 15-35%
          requestsPerMinute: Math.floor(Math.random() * 200) + 50 // 50-250
        });
      } catch (error) {
        console.error('Error loading system stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="portal-card animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Connections",
      value: stats.activeConnections,
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      title: "CPU Usage",
      value: `${stats.cpuUsage}%`,
      icon: Cpu,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Memory Usage",
      value: `${stats.memoryUsage}%`,
      icon: Activity,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Storage Used",
      value: `${stats.storageUsed}%`,
      icon: HardDrive,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Requests/Min",
      value: stats.requestsPerMinute,
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="portal-card group hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="w-full bg-muted/30 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000`}
                  style={{ 
                    width: typeof stat.value === 'string' ? stat.value : `${Math.min(stat.value / 10, 100)}%`
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};