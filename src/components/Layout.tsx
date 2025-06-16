
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "./NavBar";
import { TopNavBar } from "./TopNavBar";

const Layout = () => {
  const location = useLocation();
  const hideNav = ['/onboarding', '/onboarding-chat'].includes(location.pathname);
  const isConnectPage = location.pathname === '/connect';

  return (
    <div className={`min-h-screen flex flex-col ${isConnectPage ? '' : 'bg-white'}`}>
      {!hideNav && <TopNavBar />}
      <div className={`flex-1 ${hideNav ? 'p-0' : isConnectPage ? '' : 'container mx-auto pb-24 mt-16'}`}>
        <Outlet />
      </div>
      {!hideNav && !isConnectPage && <NavBar />}
    </div>
  );
};

export default Layout;
