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
    
    // Case 1: User is not authenticated
    if (!user) {
      // If they're on a protected route, redirect to auth
      const protectedRoutes = ["/mirror", "/settings", "/profile", "/connections"];
      const isOnProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
      
      if (isOnProtectedRoute) {
        console.log("Redirecting unauthenticated user to auth");
        navigate("/auth");
        return;
      }
      // Otherwise, let them stay where they are (landing, auth, etc.)
      return;
    }

    // Case 2: User is authenticated and has completed onboarding
    if (user && hasCompletedOnboarding) {
      // If they're on auth page, redirect to mirror
      if (isAuthPath) {
        console.log("Redirecting authenticated user with completed onboarding from auth to mirror");
        navigate("/mirror");
        return;
      }
      
      // If they're on landing page, redirect to mirror
      if (location.pathname === "/landing-v2") {
        console.log("Redirecting authenticated user with completed onboarding from landing to mirror");
        navigate("/mirror");
        return;
      }
      
      // If they're in onboarding flow but already completed, redirect to mirror
      if (isOnboardingPath) {
        console.log("Redirecting user with completed onboarding from onboarding to mirror");
        navigate("/mirror");
        return;
      }
      
      // Otherwise, let them stay where they are (mirror, settings, etc.)
      return;
    }

    // Case 3: User is authenticated but hasn't completed onboarding
    if (user && !hasCompletedOnboarding) {
      // If they're on auth page (just signed up/in), redirect to onboarding
      if (isAuthPath) {
        console.log("Redirecting new user from auth to onboarding");
        navigate("/onboarding");
        return;
      }
      
      // If they're trying to access protected routes without completing onboarding
      const protectedRoutes = ["/mirror", "/settings", "/profile", "/connections"];
      const isOnProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
      
      if (isOnProtectedRoute) {
        console.log("Redirecting user to onboarding - trying to access protected route without completing onboarding");
        navigate("/onboarding");
        return;
      }
      
      // If they're on landing page and authenticated but not onboarded, redirect to onboarding
      if (isLandingPath) {
        console.log("Redirecting authenticated but not onboarded user from landing to onboarding");
        navigate("/onboarding");
        return;
      }
      
      // If they're already in onboarding flow, let them continue
      if (isOnboardingPath) {
        return;
      }
    }

  }, [user, isLoading, profile, isNewUser, location.pathname, navigate]);

  return null;
};

export default RedirectNewUser;
