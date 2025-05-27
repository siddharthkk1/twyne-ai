
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RedirectNewUser = () => {
  const { user, isLoading, profile, isNewUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isOnboardingPath = [
    "/onboarding", 
    "/onboarding-chat", 
    "/onboarding-paste", 
    "/onboarding-results"
  ].includes(location.pathname);

  const isAuthPath = location.pathname === "/auth";
  const isLandingPath = location.pathname === "/" || location.pathname === "/landing-v2";

  useEffect(() => {
    if (isLoading) return;

    // Check if user has completed onboarding by looking at profile_data
    const hasCompletedOnboarding = profile?.profile_data && 
      Object.keys(profile.profile_data).length > 0;
    
    // If user is on auth page and already logged in with completed onboarding
    if (isAuthPath && user && hasCompletedOnboarding) {
      navigate("/mirror");
      return;
    }
    
    // If user is on landing-v2 and already logged in with completed onboarding
    if (location.pathname === "/landing-v2" && user && hasCompletedOnboarding) {
      navigate("/mirror");
      return;
    }
    
    // If user is in onboarding but has already completed it, redirect to mirror page
    if (isOnboardingPath && user && hasCompletedOnboarding) {
      navigate("/mirror");
      return;
    }

    // If user is authenticated but hasn't completed onboarding and is not on onboarding page
    if (user && (isNewUser || !hasCompletedOnboarding) && !isOnboardingPath && !isAuthPath) {
      console.log("Redirecting new user to onboarding");
      navigate("/onboarding");
      return;
    }

  }, [user, isLoading, profile, isNewUser, location.pathname, navigate]);

  return null;
};

export default RedirectNewUser;
