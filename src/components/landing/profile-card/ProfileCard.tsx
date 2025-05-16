
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, CircleUser } from "lucide-react";
import { ConnectionProfile } from "./types";
import { MutualConnections } from "./MutualConnections";
import { SharedInterests } from "./SharedInterests";
import { IdealHangs } from "./IdealHangs";
import { CompatibilityHighlights } from "./CompatibilityHighlights";

interface ProfileCardProps {
  profile: ConnectionProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <Card className="shadow-md border border-border/50 overflow-hidden pb-0">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 py-3">
        <div className="flex items-center">
          {/* Left: Avatar */}
          <Avatar className="h-14 w-14 border-2 border-white">
            <AvatarImage src={profile.avatarImage} alt={profile.name} />
            <AvatarFallback className="bg-secondary/20 text-secondary text-xl">{profile.avatar}</AvatarFallback>
          </Avatar>
          
          {/* Middle: Name and Twyne info with padding */}
          <div className="flex flex-col ml-4 flex-1">
            <p className="text-xs text-muted-foreground">Your Twyne with</p>
            <h3 className="text-2xl font-semibold">{profile.name}</h3>
          </div>
          
          {/* Right: Location vertically aligned with name */}
          <div className="flex items-center text-sm text-muted-foreground self-center">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{profile.location}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 space-y-3">
        {/* MUTUAL CONNECTIONS section - first position */}
        <MutualConnections profile={profile} />

        {/* SHARED INTERESTS section - second position */}
        <SharedInterests interests={profile.sharedInterests} />

        {/* IDEAL HANGS section - third position */}
        <IdealHangs hangs={profile.idealHangs} />

        {/* COMPATIBILITY HIGHLIGHTS section */}
        <CompatibilityHighlights highlights={profile.compatibilityHighlights} name={profile.name} />
      </CardContent>
    </Card>
  );
};
