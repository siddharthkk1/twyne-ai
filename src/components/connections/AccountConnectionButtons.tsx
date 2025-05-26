
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AccountConnectionButtons = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectSpotify = async () => {
    try {
      setIsConnecting(true);
      console.log('Initiating Spotify connection...');
      
      const { data, error } = await supabase.functions.invoke('spotify-auth-url', {
        body: { redirect_uri: `${window.location.origin}/settings` }
      });

      if (error) throw error;
      
      // The function should handle the redirect
      window.location.href = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/spotify-auth-url`;
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Spotify. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const connectYouTube = async () => {
    try {
      setIsConnecting(true);
      console.log('Initiating YouTube connection...');
      
      const { data, error } = await supabase.functions.invoke('google-auth-url', {
        body: { redirect_uri: `${window.location.origin}/settings` }
      });

      if (error) throw error;
      
      // The function should handle the redirect
      window.location.href = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url`;
    } catch (error) {
      console.error('Error connecting to YouTube:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to YouTube. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Connect Your Accounts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={connectSpotify}
          disabled={isConnecting}
          className="bg-green-500 hover:bg-green-600 text-white h-16 flex flex-col items-center justify-center gap-2"
        >
          {isConnecting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Music className="h-6 w-6" />
              <span>Connect Spotify</span>
            </>
          )}
        </Button>

        <Button 
          onClick={connectYouTube}
          disabled={isConnecting}
          className="bg-red-500 hover:bg-red-600 text-white h-16 flex flex-col items-center justify-center gap-2"
        >
          {isConnecting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Video className="h-6 w-6" />
              <span>Connect YouTube</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AccountConnectionButtons;
