import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Key, 
  Calendar,
  Copy,
  Check,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LicenseKey {
  id: string;
  key: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  last_used_at: string | null;
  description: string | null;
}

interface LicenseKeyManagerProps {
  licenseKeys: LicenseKey[];
  loading: boolean;
  onUpdate: () => void;
}

export const LicenseKeyManager = ({ licenseKeys, loading, onUpdate }: LicenseKeyManagerProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingKey, setEditingKey] = useState<LicenseKey | null>(null);
  const [newKey, setNewKey] = useState({
    description: "",
    expiresAt: "",
    customKey: ""
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateKey = async () => {
    try {
      const keyToInsert = newKey.customKey || generateRandomKey();
      
      const { error } = await supabase
        .from('license_keys')
        .insert({
          key: keyToInsert,
          description: newKey.description || null,
          expires_at: newKey.expiresAt || null,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "License key created successfully",
      });

      setShowCreateDialog(false);
      setNewKey({ description: "", expiresAt: "", customKey: "" });
      onUpdate();
    } catch (error) {
      console.error('Error creating license key:', error);
      toast({
        title: "Error",
        description: "Failed to create license key",
        variant: "destructive",
      });
    }
  };

  const handleUpdateKey = async () => {
    if (!editingKey) return;

    try {
      const { error } = await supabase
        .from('license_keys')
        .update({
          description: newKey.description,
          expires_at: newKey.expiresAt || null,
          is_active: editingKey.is_active
        })
        .eq('id', editingKey.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "License key updated successfully",
      });

      setEditingKey(null);
      setNewKey({ description: "", expiresAt: "", customKey: "" });
      onUpdate();
    } catch (error) {
      console.error('Error updating license key:', error);
      toast({
        title: "Error",
        description: "Failed to update license key",
        variant: "destructive",
      });
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this license key?")) return;

    try {
      const { error } = await supabase
        .from('license_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "License key deleted successfully",
      });

      onUpdate();
    } catch (error) {
      console.error('Error deleting license key:', error);
      toast({
        title: "Error",
        description: "Failed to delete license key",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (key: LicenseKey) => {
    try {
      const { error } = await supabase
        .from('license_keys')
        .update({ is_active: !key.is_active })
        .eq('id', key.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `License key ${key.is_active ? 'deactivated' : 'activated'}`,
      });

      onUpdate();
    } catch (error) {
      console.error('Error toggling license key:', error);
      toast({
        title: "Error",
        description: "Failed to update license key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      toast({
        title: "Copied",
        description: "License key copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const openEditDialog = (key: LicenseKey) => {
    setEditingKey(key);
    setNewKey({
      description: key.description || "",
      expiresAt: key.expires_at ? key.expires_at.split('T')[0] : "",
      customKey: ""
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Key className="w-6 h-6 text-primary" />
          License Key Management
        </h2>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="portal-button flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Key
        </Button>
      </div>

      {/* License Keys List */}
      <Card className="portal-card p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading license keys...</p>
          </div>
        ) : licenseKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No license keys found</p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="mt-4"
              variant="outline"
            >
              Create First Key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {licenseKeys.map((key) => (
              <div
                key={key.id}
                className="border border-border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="bg-secondary px-3 py-1 rounded text-sm font-mono">
                        {key.key}
                      </code>
                      <Button
                        onClick={() => copyToClipboard(key.key)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        {copiedKey === key.key ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.expires_at && (
                        <span className={isExpired(key.expires_at) ? "text-destructive" : ""}>
                          Expires: {new Date(key.expires_at).toLocaleDateString()}
                        </span>
                      )}
                      {key.last_used_at && (
                        <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    {key.description && (
                      <p className="text-sm text-muted-foreground mt-1">{key.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpired(key.expires_at) && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Expired
                      </Badge>
                    )}
                    
                    <Badge 
                      variant={key.is_active ? "default" : "secondary"}
                      className={key.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                    >
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>

                    <Button
                      onClick={() => handleToggleActive(key)}
                      variant="outline"
                      size="sm"
                    >
                      {key.is_active ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      onClick={() => openEditDialog(key)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={() => handleDeleteKey(key.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingKey} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingKey(null);
          setNewKey({ description: "", expiresAt: "", customKey: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingKey ? "Edit License Key" : "Create New License Key"}
            </DialogTitle>
            <DialogDescription>
              {editingKey ? "Update the license key details" : "Generate a new license key for access"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingKey && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Custom Key (optional)
                </label>
                <Input
                  placeholder="Leave empty to generate automatically"
                  value={newKey.customKey}
                  onChange={(e) => setNewKey({ ...newKey, customKey: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Description (optional)
              </label>
              <Input
                placeholder="e.g. Student access, Teacher account, etc."
                value={newKey.description}
                onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Expiration Date (optional)
              </label>
              <Input
                type="date"
                value={newKey.expiresAt}
                onChange={(e) => setNewKey({ ...newKey, expiresAt: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingKey(null);
                setNewKey({ description: "", expiresAt: "", customKey: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingKey ? handleUpdateKey : handleCreateKey}
              className="portal-button"
            >
              {editingKey ? "Update Key" : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};