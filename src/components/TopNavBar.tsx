
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

// The artificial boost we want to add to the waitlist count
const WAITLIST_BOOST = 524;

export const TopNavBar = () => {
  const { user } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching waitlist count...");
        
        // Instead of using count: 'exact', fetch all entries and count them
        const { data, error } = await supabase
          .from('waitlist')
          .select('id');
        
        // Log the full response data for debugging
        console.log("DETAILED DATA:", data);
        
        if (error) {
          console.error("Error fetching waitlist count:", error);
        } else {
          // Count the actual entries returned
          const actualCount = data ? data.length : 0;
          console.log("Actual count from DB:", actualCount);
          console.log("Data type:", typeof data);
          console.log("Is data an array?", Array.isArray(data));
          console.log("Setting total count to:", actualCount + WAITLIST_BOOST);
          setWaitlistCount(actualCount + WAITLIST_BOOST);
        }
      } catch (error) {
        console.error("Error in waitlist count fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistCount();
  }, []);
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <Logo />
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/onboarding" className="text-foreground/80 hover:text-primary transition-colors">
                Onboarding
              </Link>
              <Link to="/connections" className="text-foreground/80 hover:text-primary transition-colors">
                Connections
              </Link>
              <Link to="/profile" className="text-foreground/80 hover:text-primary transition-colors">
                Profile
              </Link>
              <Link to="/chat/twyne" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Chat with AI
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              {!isLoading && waitlistCount !== null && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users size={16} className="mr-1 text-primary" />
                  <span>{waitlistCount.toLocaleString()}+ members</span>
                </div>
              )}
              <Button onClick={() => setIsWaitlistOpen(true)}>
                Join Waitlist
              </Button>
            </div>
          )}
        </div>
      </div>
      <WaitlistForm open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </nav>
  );
};
