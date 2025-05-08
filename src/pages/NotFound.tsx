
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-6">
      <div className="text-center max-w-md bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
        <h1 className="text-4xl font-semibold mb-4">Oops!</h1>
        <p className="text-xl text-muted-foreground mb-6">
          We couldn't find the page you were looking for.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
