
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types/chat";
import { Check, ChevronRight } from "lucide-react";
import { ValueCard } from "./ValueCard";
import { InsightCard } from "./InsightCard";
import { PersonalityChart } from "./PersonalityChart";

interface ProfileCompletionDashboardProps {
  userProfile: UserProfile;
}

export const ProfileCompletionDashboard: React.FC<ProfileCompletionDashboardProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  
  // Ensure we have arrays even if the API returns null
  const interests = userProfile?.interests || [];
  // Check if vibeWords exists, otherwise use empty array
  const vibeWords = userProfile?.vibeWords || [];
  const twyneTags = userProfile?.twyneTags || [];
  const personalInsights = userProfile?.personalInsights || [];
  const talkingPoints = userProfile?.talkingPoints || [];
  
  // Get first name only
  const firstName = userProfile?.name?.split(' ')[0] || '';

  return (
    <div className="max-w-4xl mx-auto pt-6 pb-16 px-4">
      <div className="text-center mb-8">
        <div className="bg-green-500/10 text-green-600 font-medium px-3 py-1 rounded-full text-sm inline-flex items-center mb-3">
          <Check className="w-4 h-4 mr-1" />
          Profile Complete
        </div>
        <h1 className="text-3xl font-bold mb-2">{firstName}'s Twyne Dashboard</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Here's what we've learned about you. This helps us connect you with people who match your vibe.
        </p>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-xl mb-6 shadow-sm border">
        <h2 className="font-semibold text-xl mb-3">Your Vibe Summary</h2>
        <p className="text-muted-foreground">{userProfile?.vibeSummary}</p>
      </div>

      {/* Vibe Words */}
      {vibeWords && vibeWords.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Key Vibe Words</h3>
          <div className="flex flex-wrap gap-2">
            {vibeWords.map((word, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="text-sm py-1 px-3 bg-primary/10 text-primary-foreground hover:bg-primary/20"
              >
                {word}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Twyne Tags */}
      {twyneTags && twyneTags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Twyne Tags</h3>
          <div className="flex flex-wrap gap-2">
            {twyneTags.map((tag, index) => (
              <Badge 
                key={index}
                className="text-sm py-1 px-3 bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Interests Grid */}
      {interests && interests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Your Interests & Activities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {interests.map((interest, index) => (
              <div 
                key={index}
                className="bg-background p-3 rounded-md border text-sm"
              >
                {interest}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {userProfile?.values && Array.isArray(userProfile.values) && userProfile.values.map((value, index) => (
          <ValueCard key={index} value={value} index={index} />
        ))}
        {(!userProfile?.values || !Array.isArray(userProfile.values)) && (
          <>
            <ValueCard value={userProfile?.socialStyle || "Authentic communicator"} index={0} />
            <ValueCard value={userProfile?.coreValues || "Deep connections"} index={1} />
            <ValueCard value={userProfile?.connectionPreferences || "Meaningful interactions"} index={2} />
          </>
        )}
      </div>

      {/* Personality Charts */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Your Personality Dimensions</h3>
        <PersonalityChart traits={{
          extroversion: 65,
          openness: 80,
          empathy: 75,
          structure: 60
        }} />
      </div>

      {/* Insights */}
      <div className="mb-10">
        <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Personal Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(personalInsights) && personalInsights.length > 0 ? (
            personalInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))
          ) : (
            <>
              <InsightCard insight="Your unique perspective adds depth to conversations and helps others see things differently." index={0} />
              <InsightCard insight="You value authentic connections where both people can be themselves without judgment." index={1} />
            </>
          )}
        </div>
      </div>

      {/* Talking Points */}
      {talkingPoints && talkingPoints.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Great Conversation Topics For You</h3>
          <div className="bg-background rounded-lg border p-4">
            <ul className="space-y-2">
              {talkingPoints.map((topic, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button 
          variant="default" 
          size="lg" 
          onClick={() => navigate('/connections')}
          className="min-w-[180px]"
        >
          Explore Connections
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/dashboard')}
          className="min-w-[180px]"
        >
          View Your Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletionDashboard;
