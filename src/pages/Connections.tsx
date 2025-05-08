
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Connection {
  id: string;
  name: string;
  description: string;
  matchReason: string;
  imageUrl: string;
  isNew: boolean;
}

// Mock data for connections - will be populated from backend in production
const mockConnections: Connection[] = [
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
  const { user } = useAuth();

  // Check if the user has just completed onboarding
  const isNewlyOnboarded = user?.user_metadata?.has_onboarded === true && 
                          (!user?.user_metadata?.received_first_matches);

  // Only show connections for returning users who have received matches
  const connections = isNewlyOnboarded ? [] : mockConnections;
  const newConnections = connections.filter((c) => c.isNew);
  const pastConnections = connections.filter((c) => !c.isNew);

  // Get first letter of name for avatar placeholder
  const nameInitial = user?.user_metadata?.profile_data?.name 
    ? user.user_metadata.profile_data.name[0] 
    : user?.email?.[0] || "?";
    
  // Get profile data from user metadata
  const profileData = user?.user_metadata?.profile_data || {};

  // Generate profile insights from user data
  const generateProfileInsights = () => {
    const insights = [
      { 
        category: "Location", 
        value: profileData.location || "Not specified" 
      },
      { 
        category: "Interests", 
        value: profileData.interests?.join(", ") || profileData.talkingPoints?.join(", ") || "Not specified" 
      },
      { 
        category: "Social Style", 
        value: profileData.socialStyle || "Not specified" 
      },
      { 
        category: "Looking For", 
        value: profileData.lookingFor || "Not specified" 
      },
      { 
        category: "Weekend Activities", 
        value: profileData.weekendActivities || "Not specified" 
      },
      { 
        category: "Media Tastes", 
        value: profileData.mediaTastes || "Not specified" 
      }
    ];
    
    // Filter out insights with "Not specified" values
    return insights.filter(insight => insight.value !== "Not specified");
  };

  const profileInsights = generateProfileInsights();

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-2xl font-semibold">Connections</h1>

      {isNewlyOnboarded ? (
        // Show welcome message for newly onboarded users
        <div className="space-y-6">
          <div className="bg-background rounded-2xl p-6 text-center space-y-4 animate-fade-in">
            <h2 className="font-medium text-lg">Thanks for sharing about yourself!</h2>
            <p className="text-muted-foreground">
              We're finding people in your area who match your vibe.
              Your first introductions will arrive soon.
            </p>
            <div className="py-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <div className="h-16 w-16 text-primary flex items-center justify-center">
                  <User size={36} />
                </div>
              </div>
            </div>
            <Button 
              asChild
              variant="outline" 
              className="rounded-full"
            >
              <Link to="/chat/twyne">Chat with Twyne</Link>
            </Button>
          </div>

          {/* Profile Dashboard */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{nameInitial}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{profileData.name || "Your"} Profile</h2>
                  <p className="text-sm text-muted-foreground">Here's what we know about you so far</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profileInsights.map((insight, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium text-muted-foreground">{insight.category}</div>
                    <div className="col-span-2 text-sm">{insight.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Connections;
