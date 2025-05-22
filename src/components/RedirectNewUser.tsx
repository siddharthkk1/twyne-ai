
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RedirectNewUser = () => {
  const { isNewUser, clearNewUserFlag, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAlreadyAtOnboarding = location.pathname === "/onboarding";
  const isAuthPath = location.pathname === "/auth";

  useEffect(() => {
    // Only redirect authenticated new users to onboarding if:
    // 1. They are logged in (user exists)
    // 2. They are marked as new users
    // 3. They are not already at the onboarding page
    // 4. They are not at the auth page (which has its own redirect logic)
    if (user && isNewUser && !isAlreadyAtOnboarding && !isAuthPath) {
      console.log("Redirecting new user to onboarding");
      navigate("/onboarding");
      // Don't clear the flag yet - we'll do it in OnboardingChat when complete
    }
  }, [user, isNewUser, navigate, isAlreadyAtOnboarding, isAuthPath]);

  return null;
};

export default RedirectNewUser;
