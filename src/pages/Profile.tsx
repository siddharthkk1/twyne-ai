
import React from "react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  return (
    <div className="py-4 space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      <div className="bg-background rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="h-24 w-24 rounded-full bg-secondary/50 mb-4 flex items-center justify-center text-2xl font-semibold">
            J
          </div>
          <h2 className="text-xl font-medium">Jamie</h2>
          <p className="text-muted-foreground">San Francisco</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">ABOUT YOU</h3>
            <p className="mt-1">
              New to the city, loves hiking, photography, and discovering new coffee shops. Looking to meet like-minded people for weekend adventures.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">INTERESTS</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {["Photography", "Hiking", "Coffee", "Reading", "Art"].map((interest) => (
                <span
                  key={interest}
                  className="bg-muted px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">CONNECTION PREFERENCES</h3>
            <p className="mt-1">
              Prefers one-on-one hangouts in relaxed settings. Interested in making genuine friendships in a new city.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button variant="outline" className="w-full rounded-full">
          Edit Profile
        </Button>
        <Button variant="outline" className="w-full rounded-full">
          Notification Settings
        </Button>
        <Button variant="outline" className="w-full rounded-full text-muted-foreground">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
