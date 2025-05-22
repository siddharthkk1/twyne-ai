
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "./NavBar";
import { TopNavBar } from "./TopNavBar";

const Layout = () => {
  const location = useLocation();
  const hideNav = ['/dashboard', '/onboarding'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!hideNav && <TopNavBar />}
      <div className={`flex-1 container mx-auto p-6 pb-24 ${hideNav ? '' : 'mt-16'}`}>
        <Outlet />
      </div>
      {!hideNav && <NavBar />}
    </div>
  );
};

export default Layout;
