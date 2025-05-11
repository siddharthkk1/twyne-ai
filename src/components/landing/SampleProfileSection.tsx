
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Coffee, Book, Music, Dumbbell, Globe, CircleUser } from "lucide-react";

// Sample connection data for two different profiles
const connectionProfiles = [
  {
    id: "profile1",
    name: "Alex",
    location: "San Francisco",
    initial: "AK",
    avatar: "A", // Will be used as avatar fallback
    sharedInterests: [
      { icon: Coffee, text: "Coffee shops" },
      { icon: Book, text: "Fiction" },
      { icon: Music, text: "Indie music" },
      { icon: Dumbbell, text: "Bouldering" },
      { icon: Globe, text: "Travel" },
    ],
    idealHangs: [
      { emoji: "🏀", text: "Watching games at a sports bar" },
      { emoji: "☕️", text: "Morning Starbucks runs" },
      { emoji: "⛳", text: "Golf range" },
      { emoji: "🍺", text: "Visiting local breweries" },
      { emoji: "🎧", text: "EDM raves" },
      { emoji: "📺", text: "Anime binge session" },
    ],
    compatibilityHighlights: [
      "You both love trying unusual coffee brewing methods",
      "You both prefer meaningful 1:1 conversations"
    ],
    mutuals: [
      { name: "Sara", avatar: "S" },
      { name: "John", avatar: "J" },
      { name: "Mei", avatar: "M" }
    ],
    connectionDegrees: 1
  },
  {
    id: "profile2",
    name: "Jordan",
    location: "Berkeley",
    initial: "JT",
    avatar: "J",
    sharedInterests: [
      { icon: Music, text: "Jazz" },
      { icon: Book, text: "Non-fiction" },
      { icon: Globe, text: "Mountains" },
      { icon: Coffee, text: "Tea ceremonies" },
    ],
    idealHangs: [
      { emoji: "🎸", text: "Live music venues" },
      { emoji: "🥾", text: "Hiking trails" },
      { emoji: "🧘", text: "Yoga in the park" },
      { emoji: "📚", text: "Bookstore browsing" },
      { emoji: "🎨", text: "Museum visits" },
      { emoji: "🍵", text: "Tea tasting" },
    ],
    compatibilityHighlights: [
      "You both love finding hidden cultural spots in the city",
      "You both enjoy deep conversations about philosophy"
    ],
    mutuals: [],
    connectionDegrees: 2
  }
];

export const SampleProfileSection = () => {
  const [activeProfile, setActiveProfile] = useState(0);

  const handleProfileChange = (index: number) => {
    setActiveProfile(index);
  };

  const profile = connectionProfiles[activeProfile];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How You View Others</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Twyne creates personalized connection profiles that highlight what you share with each new acquaintance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-4">Twyne Profile</h3>
            <p className="mb-6">
              Through conversations with our AI, we identify meaningful connections between you and potential friends—your shared interests, complementary energies, and compatible activities.
            </p>
            <p className="mb-6">
              <span className="font-medium">This is not public.</span> These connection profiles are only visible between connected individuals and they contain only information both users have agreed to share.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10">No endless swiping</Badge>
              <Badge variant="outline" className="bg-secondary/5 hover:bg-secondary/10">No public profiles</Badge>
              <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10">No awkward icebreakers</Badge>
            </div>
          </div>

          <Card className="shadow-md border border-border/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 py-3">
              <div className="flex items-center space-x-4">
                <Avatar className="h-14 w-14 border-2 border-white">
                  <AvatarFallback className="bg-secondary/20 text-secondary text-xl">{profile.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Your Twyne with</p>
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{profile.location}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {/* MUTUALS section - moved to first position */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1.5">MUTUAL CONNECTIONS</h4>
                {profile.mutuals.length > 0 ? (
                  <div className="flex items-center -space-x-2">
                    {profile.mutuals.map((mutual, i) => (
                      <Avatar key={i} className="border-2 border-white h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{mutual.avatar}</AvatarFallback>
                      </Avatar>
                    ))}
                    {profile.mutuals.length > 0 && (
                      <span className="ml-3 text-sm text-muted-foreground">
                        Connected through {profile.mutuals.map(m => m.name).join(", ")}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CircleUser className="h-4 w-4 mr-1.5 text-muted-foreground/70" />
                    <span>You are {profile.connectionDegrees} {profile.connectionDegrees === 1 ? 'degree' : 'degrees'} of connection apart</span>
                  </div>
                )}
              </div>

              {/* SHARED INTERESTS section - moved to second position */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1.5">SHARED INTERESTS</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.sharedInterests.map((interest, i) => (
                    <div key={i} className="flex items-center bg-muted rounded-full px-2.5 py-0.5 text-xs">
                      <interest.icon className="h-3 w-3 mr-1" />
                      <span>{interest.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IDEAL HANGS section - moved to third position and modernized */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1.5">IDEAL HANGS</h4>
                <div className="grid grid-cols-2 gap-2">
                  {profile.idealHangs.map((hang, i) => {
                    // Modern tech gradient backgrounds
                    const gradients = [
                      'from-blue-100 to-indigo-50 border-blue-200',
                      'from-purple-100 to-pink-50 border-purple-200',
                      'from-green-100 to-teal-50 border-green-200',
                      'from-amber-100 to-yellow-50 border-amber-200',
                      'from-rose-100 to-red-50 border-rose-200',
                      'from-sky-100 to-cyan-50 border-sky-200'
                    ];
                    
                    return (
                      <div 
                        key={i} 
                        className={`bg-gradient-to-br ${gradients[i % gradients.length]} border rounded-lg p-2 flex items-center shadow-sm transition-transform hover:scale-[1.02]`}
                      >
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-white/70 mr-2 flex-shrink-0">
                          <span className="text-lg">{hang.emoji}</span>
                        </div>
                        <span className="text-sm font-medium">{hang.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COMPATIBILITY HIGHLIGHTS section - kept as fourth position */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">COMPATIBILITY HIGHLIGHTS</h4>
                <div className="space-y-1.5">
                  {profile.compatibilityHighlights.map((highlight, i) => (
                    <div key={i} className="bg-primary/5 rounded-lg p-1.5 text-sm">
                      <span className="font-medium">You both</span> {highlight.substring(9)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile switcher dots */}
          <div className="hidden md:block">
            {/* Empty placeholder to maintain grid layout */}
          </div>
          <div className="flex justify-center mt-4 space-x-3">
            {connectionProfiles.map((_, index) => (
              <button 
                key={index}
                onClick={() => handleProfileChange(index)}
                className={`h-3 w-3 rounded-full transition-all ${
                  activeProfile === index ? 'bg-primary scale-125' : 'bg-muted'
                }`}
                aria-label={`View profile ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
