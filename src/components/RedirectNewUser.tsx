
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

    // If no user and on protected route (like /mirror), redirect to auth
    if (!user && location.pathname === "/mirror") {
      navigate("/auth");
      return;
    }

    // If user exists, check onboarding status
    if (user) {
      const hasCompletedOnboarding = profile?.profile_data && 
        Object.keys(profile.profile_data).length > 0;
      
      // If user is on auth page and already logged in with completed onboarding
      if (isAuthPath && hasCompletedOnboarding) {
        navigate("/mirror");
        return;
      }
      
      // If user is on landing-v2 and already logged in with completed onboarding
      if (location.pathname === "/landing-v2" && hasCompletedOnboarding) {
        navigate("/mirror");
        return;
      }
      
      // If user is in onboarding but has already completed it, redirect to mirror page
      if (isOnboardingPath && hasCompletedOnboarding) {
        navigate("/mirror");
        return;
      }

      // If user hasn't completed onboarding and is on mirror page, redirect to onboarding
      if (!hasCompletedOnboarding && location.pathname === "/mirror") {
        navigate("/onboarding");
        return;
      }
    }

  }, [user, isLoading, profile, location.pathname, navigate]);

  return null;
};

export default RedirectNewUser;
