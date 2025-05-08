
import React from "react";
import ConnectionCard from "./ConnectionCard";
import { Sparkles } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  description: string;
  matchReason: string;
  imageUrl: string;
  isNew: boolean;
}

interface NewConnectionsSectionProps {
  connections: Connection[];
}

const NewConnectionsSection = ({ connections }: NewConnectionsSectionProps) => {
  if (connections.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
          <Sparkles size={14} className="text-secondary" />
        </div>
        <h2 className="text-lg font-medium text-foreground">This Week's Introductions</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        These are people I think you'll click with. Connect to say hi and see your full compatibility profile.
      </p>

      {connections.map((connection) => (
        <ConnectionCard key={connection.id} {...connection} />
      ))}
    </div>
  );
};

export default NewConnectionsSection;
