
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RedirectNewUser = () => {
  const { isNewUser, clearNewUserFlag } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAlreadyAtOnboarding = location.pathname === "/onboarding";

  useEffect(() => {
    if (isNewUser && !isAlreadyAtOnboarding) {
      navigate("/onboarding");
      clearNewUserFlag();
    }
  }, [isNewUser, navigate, clearNewUserFlag, isAlreadyAtOnboarding]);

  return null;
};

export default RedirectNewUser;
