
import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ size = "md" }: LogoProps) => {
  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="rounded-full bg-primary/20 p-1.5 flex items-center justify-center">
        <Users className={`${iconSize[size]} text-primary`} />
      </div>
      <span className={`font-bold ${size === "lg" ? "text-xl" : "text-lg"} gradient-text`}>Twyne</span>
    </Link>
  );
};
