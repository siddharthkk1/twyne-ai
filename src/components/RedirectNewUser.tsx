
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RedirectNewUser = () => {
  const { user, isLoading, profile } = useAuth();
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
    
    // If user is on landing v1 ("/") and not logged in, redirect to landing v2
    if (location.pathname === "/" && !user) {
      navigate("/landing-v2");
      return;
    }
    
    // If user is on auth page or landing page and already logged in with completed onboarding
    if ((isAuthPath || isLandingPath) && user && hasCompletedOnboarding) {
      navigate("/mirror");
      return;
    }
    
    // If user is in onboarding but has already completed it, redirect to mirror page
    if (isOnboardingPath && user && hasCompletedOnboarding) {
      navigate("/mirror");
      return;
    }

  }, [user, isLoading, profile, location.pathname, navigate]);

  return null;
};

export default RedirectNewUser;
