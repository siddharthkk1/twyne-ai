
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  description: string;
  matchReason: string;
  imageUrl: string;
  isNew: boolean;
}

// Mock data for connections
const connections: Connection[] = [
  {
    id: "1",
    name: "Nina",
    description: "New to the city, loves hiking, photography, and quiet cafés",
    matchReason: "You both just moved to the city and like keeping things chill",
    imageUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=200&h=200",
    isNew: true,
  },
  {
    id: "2",
    name: "Jordan",
    description: "Musician, plant enthusiast, and weekend explorer",
    matchReason: "You share an interest in indie music and exploring hidden spots in the city",
    imageUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=200&h=200",
    isNew: true,
  },
];

const Connections = () => {
  const newConnections = connections.filter((c) => c.isNew);
  const pastConnections = connections.filter((c) => !c.isNew);

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-2xl font-semibold">Connections</h1>

      {newConnections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">This Week's Introductions</h2>
          <p className="text-sm text-muted-foreground">
            These are people I think you'll click with. Take your time to say hi.
          </p>

          {newConnections.map((connection) => (
            <div
              key={connection.id}
              className="bg-background rounded-2xl p-4 shadow-sm animate-fade-in"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full overflow-hidden">
                  <img
                    src={connection.imageUrl}
                    alt={connection.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{connection.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {connection.description}
                  </p>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-3 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Why you might click:</span>{" "}
                  {connection.matchReason}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  asChild 
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  <Link to={`/chat/${connection.id}`}>
                    <MessageCircle size={18} className="mr-2" />
                    Say Hi
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-full text-muted-foreground"
                >
                  Not Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-secondary/20 rounded-2xl p-6 text-center">
        <h2 className="font-medium mb-2">Next matches coming soon</h2>
        <p className="text-sm text-muted-foreground mb-4">
          I'm looking for people who match your vibe. New introductions arrive weekly.
        </p>
        <Button 
          asChild
          variant="outline" 
          className="rounded-full"
        >
          <Link to="/chat/twyne">Chat with Twyne</Link>
        </Button>
      </div>
    </div>
  );
};

export default Connections;
