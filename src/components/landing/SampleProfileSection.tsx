
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Coffee, Book, Music, Dumbbell, Globe } from "lucide-react";

export const SampleProfileSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Your Connection Profiles</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Twyne creates personalized connection profiles that highlight what you share with each match
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-4">Connection Profile</h3>
            <p className="mb-6">
              Through conversations with our AI, we identify meaningful connections between you and potential friends—your shared interests, complementary energies, and compatible activities.
            </p>
            <p className="mb-6">
              <span className="font-medium">This is not public.</span> These connection profiles are only visible between matched individuals—never publicly visible like social media profiles.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10">No endless swiping</Badge>
              <Badge variant="outline" className="bg-secondary/5 hover:bg-secondary/10">No public profiles</Badge>
              <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10">No awkward icebreakers</Badge>
            </div>
          </div>

          <Card className="shadow-md border border-border/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-2">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarFallback className="bg-secondary/20 text-secondary text-xl">AK</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Your connection with</p>
                  <h3 className="text-xl font-semibold">Alex Kim</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>San Francisco (15 min from you)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1.5">SHARED INTERESTS</h4>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center bg-muted rounded-full px-3 py-1 text-xs">
                      <Coffee className="h-3 w-3 mr-1.5" />
                      <span>Coffee shops</span>
                    </div>
                    <div className="flex items-center bg-muted rounded-full px-3 py-1 text-xs">
                      <Book className="h-3 w-3 mr-1.5" />
                      <span>Fiction</span>
                    </div>
                    <div className="flex items-center bg-muted rounded-full px-3 py-1 text-xs">
                      <Music className="h-3 w-3 mr-1.5" />
                      <span>Indie music</span>
                    </div>
                    <div className="flex items-center bg-muted rounded-full px-3 py-1 text-xs">
                      <Dumbbell className="h-3 w-3 mr-1.5" />
                      <span>Bouldering</span>
                    </div>
                    <div className="flex items-center bg-muted rounded-full px-3 py-1 text-xs">
                      <Globe className="h-3 w-3 mr-1.5" />
                      <span>Travel</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1.5">IDEAL HANGS</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 rounded-lg p-2 flex items-center">
                      <span className="text-lg mr-2">🏀</span>
                      <span className="text-sm">Watching games at a sports bar</span>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-lg p-2 flex items-center">
                      <span className="text-lg mr-2">🍺</span>
                      <span className="text-sm">Checking out local breweries</span>
                    </div>
                    <div className="bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 rounded-lg p-2 flex items-center">
                      <span className="text-lg mr-2">☀️</span>
                      <span className="text-sm">Morning walks with coffee</span>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-green-50 border border-green-200 rounded-lg p-2 flex items-center">
                      <span className="text-lg mr-2">⛳</span>
                      <span className="text-sm">Golf or driving range</span>
                    </div>
                    <div className="bg-gradient-to-br from-red-100 to-red-50 border border-red-200 rounded-lg p-2 flex items-center">
                      <span className="text-lg mr-2">📚</span>
                      <span className="text-sm">Reading sessions at library</span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 rounded-lg p-2 flex items-center">
                      <span className="text-lg mr-2">🎧</span>
                      <span className="text-sm">EDM raves & festivals</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1.5">COMPATIBILITY HIGHLIGHTS</h4>
                  <div className="space-y-2">
                    <div className="bg-primary/5 rounded-lg p-2.5 text-sm">
                      <span className="font-medium">You both</span> love trying unusual coffee brewing methods
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-2.5 text-sm">
                      <span className="font-medium">You both</span> prefer meaningful 1:1 conversations over group settings
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
