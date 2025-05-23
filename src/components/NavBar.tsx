
import { NavLink } from "react-router-dom";
import { User, Settings } from "lucide-react";

export const NavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 shadow-lg">
      <div className="container max-w-lg mx-auto flex justify-around items-center">
        <NavLink
          to="/mirror"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-lg ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <User size={22} />
          <span className="text-xs mt-1">Your Mirror</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-lg ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Settings size={22} />
          <span className="text-xs mt-1">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};
