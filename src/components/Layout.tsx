
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "./NavBar";
import { TopNavBar } from "./TopNavBar";

const Layout = () => {
  const location = useLocation();
  const hideTopNav = ['/dashboard', '/onboarding'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!hideTopNav && <TopNavBar />}
      <div className={`flex-1 container mx-auto p-6 pb-24 ${hideTopNav ? '' : 'mt-16'}`}>
        <Outlet />
      </div>
      <NavBar />
    </div>
  );
};

export default Layout;
