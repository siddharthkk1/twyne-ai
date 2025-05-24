import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RedirectNewUser = () => {
  const { user, isNewUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If the user is new, redirect them to onboarding
    // This should happen only once after sign up/login
    if (user && isNewUser) {
      const onboardingRoutes = [
        '/onboarding', 
        '/onboarding-chat', 
        '/onboarding-paste', 
        '/onboarding-results'
      ];
      
      // Only redirect if user is not already on an onboarding page
      if (!onboardingRoutes.includes(location.pathname)) {
        navigate('/onboarding');
      }
    }
  }, [user, isNewUser, navigate, location.pathname]);

  return null;
};

export default RedirectNewUser;
