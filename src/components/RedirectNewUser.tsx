
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
    
    console.log("RedirectNewUser - User:", !!user, "Has completed onboarding:", hasCompletedOnboarding, "Is new user:", isNewUser, "Current path:", location.pathname);
    
    // If user is on auth page and already logged in with completed onboarding
    if (isAuthPath && user && hasCompletedOnboarding) {
      console.log("Redirecting from auth to mirror - user has completed onboarding");
      navigate("/mirror");
      return;
    }
    
    // If user is on landing-v2 and already logged in with completed onboarding
    if (location.pathname === "/landing-v2" && user && hasCompletedOnboarding) {
      console.log("Redirecting from landing to mirror - user has completed onboarding");
      navigate("/mirror");
      return;
    }
    
    // If user is in onboarding but has already completed it, redirect to mirror page
    if (isOnboardingPath && user && hasCompletedOnboarding) {
      console.log("Redirecting from onboarding to mirror - user has completed onboarding");
      navigate("/mirror");
      return;
    }

    // If user is authenticated but hasn't completed onboarding and is not on onboarding or auth page
    if (user && !hasCompletedOnboarding && !isOnboardingPath && !isAuthPath && !isLandingPath) {
      console.log("Redirecting to onboarding - user needs to complete onboarding");
      navigate("/onboarding");
      return;
    }

    // Special case: if user just signed up with Google and is on auth page, redirect to onboarding
    if (isAuthPath && user && !hasCompletedOnboarding) {
      console.log("Redirecting new Google user from auth to onboarding");
      navigate("/onboarding");
      return;
    }

  }, [user, isLoading, profile, isNewUser, location.pathname, navigate]);

  return null;
};

export default RedirectNewUser;
