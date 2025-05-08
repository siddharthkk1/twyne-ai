
import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <div className="flex-1 container max-w-lg mx-auto p-6 pb-24">
        <Outlet />
      </div>
      <NavBar />
    </div>
  );
};

export default Layout;
