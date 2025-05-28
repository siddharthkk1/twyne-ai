
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RedirectNewUser = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Only protect mirror and settings pages
    const protectedPaths = ["/mirror", "/settings"];
    const isProtectedPath = protectedPaths.includes(location.pathname);

    // If no user and on protected route, redirect to auth
    if (!user && isProtectedPath) {
      navigate("/auth");
      return;
    }

  }, [user, isLoading, location.pathname, navigate]);

  return null;
};

export default RedirectNewUser;
