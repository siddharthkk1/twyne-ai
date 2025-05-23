
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "./NavBar";
import { TopNavBar } from "./TopNavBar";

const Layout = () => {
  const location = useLocation();
  const hideNav = ['/onboarding', '/onboarding-chat'].includes(location.pathname);

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
