
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

  useEffect(() => {
    if (isLoading) return;

    // If user is not logged in and on protected route, Auth page will handle
    if (!user) return;
    
    // If user is new and not in onboarding, redirect to onboarding
    if (isNewUser && !isOnboardingPath) {
      navigate("/onboarding");
    }
    
    // If user is on auth page and already logged in, redirect to mirror page
    if (isAuthPath && user) {
      navigate("/mirror");
    }
    
    // If user is in onboarding but has already onboarded, redirect to mirror page
    if (isOnboardingPath && user && !isNewUser) {
      navigate("/mirror");
    }

  }, [user, isLoading, isNewUser, location.pathname]);

  return null;
};

export default RedirectNewUser;
