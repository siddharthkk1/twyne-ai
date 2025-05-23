
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "./NavBar";
import { TopNavBar } from "./TopNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const hideNav = ['/onboarding', '/onboarding-chat'].includes(location.pathname);

  // If user is not logged in, redirect to auth page
  if (!isLoading && !user && !hideNav) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!hideNav && <TopNavBar />}
      <div className={`flex-1 container mx-auto ${hideNav ? 'p-0' : 'pb-24 mt-16'}`}>
        <Outlet />
      </div>
      {!hideNav && <NavBar />}
    </div>
  );
};

export default Layout;
