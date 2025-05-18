
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, isNewUser } = useAuth();
  const location = useLocation();
  const isOnboardingPath = location.pathname === "/onboarding";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If user isn't logged in, redirect to auth
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // If this is a new user and they're not at onboarding, RedirectNewUser will handle it
  // If they're already at onboarding, let them stay there
  return <>{children}</>;
};

export default ProtectedRoute;
