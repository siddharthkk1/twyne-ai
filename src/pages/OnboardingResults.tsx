
import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const OnboardingResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the userProfile from location state
  const userProfile = location.state?.userProfile;
  
  // If no userProfile is provided, redirect to onboarding selection
  if (!userProfile) {
    return <Navigate to="/onboarding" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      {/* Add back button */}
      <div className="container mx-auto px-4 pt-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/onboarding")}
          className="text-sm flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to options
        </Button>
      </div>
      
      <div className="flex-1">
        <ProfileCompletionDashboard userProfile={userProfile} />
      </div>
    </div>
  );
};

export default OnboardingResults;
