
import { NavLink } from "react-router-dom";
import { Home, User } from "lucide-react";

export const NavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 shadow-lg">
      <div className="container max-w-lg mx-auto flex justify-around items-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-lg ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
          end
        >
          <Home size={22} />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
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
      </div>
    </nav>
  );
};
