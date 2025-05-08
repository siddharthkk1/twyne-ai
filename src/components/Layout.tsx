
import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <div className="flex-1 container max-w-lg mx-auto p-4 pb-20">
        <Outlet />
      </div>
      <NavBar />
    </div>
  );
};

export default Layout;
