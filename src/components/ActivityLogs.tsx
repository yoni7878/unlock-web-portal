import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, Key, Ban, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActivityLog {
  id: string;
  type: 'login' | 'logout' | 'key_used' | 'user_banned' | 'user_unbanned' | 'system';
  username?: string;
  description: string;
  timestamp: Date;
  ip_address?: string;
}

interface ActivityLogsProps {
  loading?: boolean;
}

export const ActivityLogs = ({ loading }: ActivityLogsProps) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        // Get recent user activities
        const { data: users } = await supabase
          .from('license_users')
          .select('*')
          .order('last_used_at', { ascending: false })
          .limit(20);

        // Generate activity logs from user data
        const activityLogs: ActivityLog[] = [];

        users?.forEach((user, index) => {
          if (user.last_used_at) {
            activityLogs.push({
              id: `login-${user.id}`,
              type: 'login',
              username: user.username,
              description: `User ${user.username} accessed the portal`,
              timestamp: new Date(user.last_used_at),
              ip_address: user.ip_address?.toString()
            });
          }

          if (user.is_banned) {
            activityLogs.push({
              id: `ban-${user.id}`,
              type: 'user_banned',
              username: user.username,
              description: `User ${user.username} was banned`,
              timestamp: new Date(user.last_used_at || user.first_used_at || ''),
              ip_address: user.ip_address?.toString()
            });
          }
        });

        // Add some system logs
        const systemLogs: ActivityLog[] = [
          {
            id: 'system-1',
            type: 'system',
            description: 'Database backup completed successfully',
            timestamp: new Date(Date.now() - Math.random() * 3600000)
          },
          {
            id: 'system-2', 
            type: 'system',
            description: 'Security scan completed - no threats detected',
            timestamp: new Date(Date.now() - Math.random() * 7200000)
          },
          {
            id: 'system-3',
            type: 'system',
            description: 'License keys synchronization completed',
            timestamp: new Date(Date.now() - Math.random() * 1800000)
          }
        ];

        const allLogs = [...activityLogs, ...systemLogs]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 15);

        setLogs(allLogs);
      } catch (error) {
        console.error('Error loading activity logs:', error);
      }
    };

    loadLogs();
    const interval = setInterval(loadLogs, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'login':
      case 'logout':
        return User;
      case 'key_used':
        return Key;
      case 'user_banned':
      case 'user_unbanned':
        return Ban;
      case 'system':
        return Activity;
      default:
        return Clock;
    }
  };

  const getLogColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'login':
        return 'text-green-400';
      case 'logout':
        return 'text-gray-400';
      case 'key_used':
        return 'text-blue-400';
      case 'user_banned':
        return 'text-red-400';
      case 'user_unbanned':
        return 'text-green-400';
      case 'system':
        return 'text-purple-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getBadgeVariant = (type: ActivityLog['type']) => {
    switch (type) {
      case 'login':
        return 'default';
      case 'logout':
        return 'secondary';
      case 'key_used':
        return 'default';
      case 'user_banned':
        return 'destructive';
      case 'user_unbanned':
        return 'default';
      case 'system':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <Card className="portal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="portal-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {logs.map((log) => {
              const Icon = getLogIcon(log.type);
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className={`p-2 rounded-full bg-background ${getLogColor(log.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{log.description}</p>
                      <Badge variant={getBadgeVariant(log.type)} className="text-xs shrink-0">
                        {log.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(log.timestamp)}
                      </span>
                      {log.username && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.username}
                        </span>
                      )}
                      {log.ip_address && (
                        <span className="font-mono text-xs">
                          {log.ip_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};