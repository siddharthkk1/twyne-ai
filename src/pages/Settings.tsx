
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Music, Video, ExternalLink } from "lucide-react";
import HumanAvatar3D from "@/components/HumanAvatar3D";

const Settings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Avatar Section - Full width background */}
      <div className="w-full bg-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-4">Settings</h1>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Your Avatar
            </h2>
            <div className="flex justify-center">
              <HumanAvatar3D className="h-96 w-full max-w-md" />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Your personalized 3D avatar
            </p>
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Spotify Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Spotify account in the Connections section to sync your music data.
              </p>
              <Button 
                onClick={() => navigate('/connections')}
                className="w-full flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Go to Connections
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                YouTube Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your YouTube account in the Connections section to sync your video data.
              </p>
              <Button 
                onClick={() => navigate('/connections')}
                className="w-full flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Go to Connections
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="destructive" 
                className="w-full flex items-center justify-center gap-2" 
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
