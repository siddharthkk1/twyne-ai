
import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { TopNavBar } from "./TopNavBar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <TopNavBar />
      <div className="flex-1 container mx-auto p-6 pb-24 mt-16">
        <Outlet />
      </div>
      <NavBar />
    </div>
  );
};

export default Layout;
