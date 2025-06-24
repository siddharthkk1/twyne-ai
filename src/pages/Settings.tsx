import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, User, Shield, Bell, Trash2 } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out: " + error.message);
      } else {
        toast.success("Successfully signed out");
        navigate("/landing-v2");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("An unexpected error occurred while signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center pt-16">
        <Card className="max-w-md mx-auto shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-slate-800">Access Denied</CardTitle>
            <CardDescription className="text-slate-600">Please log in to access settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-y-auto">
      <div className="min-h-full px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-lg text-slate-600">
              Manage your account and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Account Information */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="text-slate-800 font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Member Since</label>
                  <p className="text-slate-800">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Control your privacy and security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Advanced privacy settings are coming soon. You'll be able to control:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4">
                  <li>Profile visibility settings</li>
                  <li>Data sharing preferences</li>
                  <li>Communication controls</li>
                  <li>Account security options</li>
                </ul>
                <Button variant="outline" disabled>
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Settings (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Notification settings will be available soon to help you stay connected without being overwhelmed.
                </p>
                <Button variant="outline" disabled>
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Account Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-800">Sign Out</h3>
                    <p className="text-sm text-slate-600">Sign out of your account on this device</p>
                  </div>
                  <Button 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {isSigningOut ? "Signing Out..." : "Sign Out"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h3 className="font-medium text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                  <Button 
                    variant="destructive"
                    disabled
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
