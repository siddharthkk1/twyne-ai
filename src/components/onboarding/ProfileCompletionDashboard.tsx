
import React from "react";
import { UserProfile } from "@/types/chat";
import InsightCard from "./InsightCard";
import PersonalityChart from "./PersonalityChart";
import ValueCard from "./ValueCard";
import { Loader } from "lucide-react";

interface ProfileCompletionDashboardProps {
  userProfile: UserProfile;
  isGeneratingProfile?: boolean;
}

export const ProfileCompletionDashboard = ({ 
  userProfile,
  isGeneratingProfile = false
}: ProfileCompletionDashboardProps) => {
  if (isGeneratingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[50vh] animate-fade-in">
        <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-medium mb-2">Building your dashboard...</h2>
        <p className="text-muted-foreground text-center max-w-md">
          We're creating your personalized profile dashboard based on our conversation.
          This will only take a moment.
        </p>
      </div>
    );
  }

  // Extract profile data for rendering
  const { 
    name, 
    personalityTraits, 
    personalInsights = [],
    coreValues = [] 
  } = userProfile;

  // Convert coreValues to array if it's a string
  const coreValuesArray = typeof coreValues === 'string' 
    ? [coreValues] 
    : (Array.isArray(coreValues) ? coreValues : []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {name ? `${name}'s Dashboard` : 'Your Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          Based on our conversation, here's what we've learned about you
        </p>
      </div>

      {/* Personality Traits Radar Chart */}
      {personalityTraits && (
        <div className="bg-background rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-medium mb-4">Your Personality Dimensions</h2>
          <PersonalityChart traits={personalityTraits} />
        </div>
      )}

      {/* Core Values */}
      {coreValuesArray.length > 0 && (
        <div className="bg-background rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-medium mb-4">Your Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coreValuesArray.map((value, index) => (
              <ValueCard key={index} value={value} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Personal Insights */}
      {personalInsights && personalInsights.length > 0 && (
        <div className="bg-background rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-medium mb-4">Personal Insights</h2>
          <div className="grid grid-cols-1 gap-4">
            {personalInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
