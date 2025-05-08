
import React from "react";
import ConnectionCard from "./ConnectionCard";

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
      <h2 className="text-lg font-medium text-foreground">This Week's Introductions</h2>
      <p className="text-sm text-muted-foreground">
        These are people I think you'll click with. Take your time to say hi.
      </p>

      {connections.map((connection) => (
        <ConnectionCard key={connection.id} {...connection} />
      ))}
    </div>
  );
};

export default NewConnectionsSection;
