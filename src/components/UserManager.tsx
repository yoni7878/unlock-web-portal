import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Ban, 
  Shield, 
  Mail,
  Clock,
  Key,
  UserX,
  UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LicenseUser {
  id: string;
  license_key_id: string;
  username: string;
  email: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  is_banned: boolean;
  first_used_at: string;
  last_used_at: string;
  license_keys?: {
    key: string;
    description: string;
  } | null;
}

interface UserManagerProps {
  loading: boolean;
  onUpdate: () => void;
}

export const UserManager = ({ loading, onUpdate }: UserManagerProps) => {
  const [users, setUsers] = useState<LicenseUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('license_users')
        .select(`
          *,
          license_keys (
            key,
            description
          )
        `)
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      setUsers((data || []) as LicenseUser[]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleBanUser = async (userId: string, currentBanStatus: boolean) => {
    try {
      const newBanStatus = !currentBanStatus;
      const { error } = await supabase
        .from('license_users')
        .update({ 
          is_banned: newBanStatus,
          last_used_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state immediately for better UX
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_banned: newBanStatus }
          : user
      ));

      // Show success message
      console.log(`User ${newBanStatus ? 'banned' : 'unbanned'} successfully`);
      
      onUpdate?.();
    } catch (error) {
      console.error('Error updating user ban status:', error);
      // Revert local state on error
      loadUsers();
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.license_keys?.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="portal-card p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Users className="w-6 h-6" />
            User Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage users and their access permissions</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-80"
          />
        </div>
      </div>

      {loadingUsers || loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? "No users found matching your search" : "No users found"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="portal-card p-4 hover:border-primary/40 transition-all">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{user.username}</h3>
                        {user.is_banned ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <UserX className="w-3 h-3" />
                            Banned
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium">License Key</p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {user.license_keys?.key || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="font-medium">First Used</p>
                        <p className="text-muted-foreground">
                          {formatDate(user.first_used_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-medium">Last Active</p>
                        <p className="text-muted-foreground">
                          {formatDate(user.last_used_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {user.license_keys?.description && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">License:</span> {user.license_keys.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleBanUser(user.id, user.is_banned)}
                    variant={user.is_banned ? "secondary" : "destructive"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {user.is_banned ? (
                      <>
                        <Shield className="w-4 h-4" />
                        Unban
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" />
                        Ban
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {users.filter(u => !u.is_banned).length}
            </p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">
              {users.filter(u => u.is_banned).length}
            </p>
            <p className="text-sm text-muted-foreground">Banned Users</p>
          </div>
        </div>
      </div>
    </Card>
  );
};