
import { NavLink } from "react-router-dom";
import { MessageCircle, Users, User } from "lucide-react";

export const NavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 shadow-lg">
      <div className="container max-w-lg mx-auto flex justify-around items-center">
        <NavLink
          to="/connections"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-lg ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Users size={22} />
          <span className="text-xs mt-1">Connections</span>
        </NavLink>
        <NavLink
          to="/chat/twyne"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-lg ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <MessageCircle size={22} />
          <span className="text-xs mt-1">Chat</span>
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-lg ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <User size={22} />
          <span className="text-xs mt-1">Dashboard</span>
        </NavLink>
      </div>
    </nav>
  );
};
