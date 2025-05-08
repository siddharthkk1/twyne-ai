
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RedirectNewUser = () => {
  const { isNewUser, clearNewUserFlag } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isNewUser) {
      navigate("/onboarding");
      clearNewUserFlag();
    }
  }, [isNewUser, navigate, clearNewUserFlag]);

  return null;
};

export default RedirectNewUser;
