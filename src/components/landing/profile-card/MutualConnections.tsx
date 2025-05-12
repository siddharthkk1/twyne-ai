
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CircleUser } from "lucide-react";
import { ConnectionProfile } from "./types";

interface MutualConnectionsProps {
  profile: ConnectionProfile;
}

export const MutualConnections: React.FC<MutualConnectionsProps> = ({ profile }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1.5">MUTUALS</h4>
      {profile.mutuals.length > 0 ? (
        <div>
          <div className="flex items-center -space-x-2 mb-1">
            {profile.mutuals.map((mutual, i) => (
              <Avatar key={i} className="border-2 border-white h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{mutual.avatar}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center text-sm text-muted-foreground">
          <CircleUser className="h-4 w-4 mr-1.5 text-muted-foreground/70" />
          <span>You are {profile.connectionDegrees} {profile.connectionDegrees === 1 ? 'degree' : 'degrees'} of connection apart</span>
        </div>
      )}
    </div>
  );
};
