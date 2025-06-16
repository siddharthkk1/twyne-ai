
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { ConnectionProfile } from "./types";

interface MutualConnectionsProps {
  profile: ConnectionProfile;
}

export const MutualConnections: React.FC<MutualConnectionsProps> = ({ profile }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1.5">MUTUALS</h4>
      {profile.mutuals.length > 0 ? (
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex -space-x-1">
            {profile.mutuals.map((mutual, i) => (
              <Avatar key={i} className="border-2 border-white h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{mutual.avatar}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {profile.mutuals.map(m => m.name).join(', ')}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            You are {profile.connectionDegrees} {profile.connectionDegrees === 1 ? 'degree' : 'degrees'} of connection apart
          </span>
        </div>
      )}
    </div>
  );
};
