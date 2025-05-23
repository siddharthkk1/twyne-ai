
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RedirectNewUser = () => {
  const { user, isLoading, isNewUser, clearNewUserFlag } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isOnboardingPath = [
    "/onboarding", 
    "/onboarding-chat", 
    "/onboarding-paste", 
    "/onboarding-results"
  ].includes(location.pathname);

  const isAuthPath = location.pathname === "/auth";
  const isLandingPath = location.pathname === "/";
  const isProtectedPath = !isOnboardingPath && !isAuthPath && !isLandingPath;

  useEffect(() => {
    if (isLoading) return;

    // If user is not logged in and on protected route, Auth page will handle
    if (!user) return;
    
    // If user is new and not in onboarding, redirect to onboarding
    if (isNewUser && !isOnboardingPath) {
      navigate("/onboarding");
      return;
    }
    
    // If user is on auth page or landing page and already logged in, redirect to mirror page
    if ((isAuthPath || isLandingPath) && user) {
      navigate("/mirror");
      return;
    }
    
    // If user is in onboarding but has already onboarded, redirect to mirror page
    if (isOnboardingPath && user && !isNewUser) {
      navigate("/mirror");
      return;
    }

  }, [user, isLoading, isNewUser, location.pathname, navigate, isProtectedPath]);

  return null;
};

export default RedirectNewUser;
