
import React from "react";
import ConnectionCard from "@/components/connections/ConnectionCard";
import NewConnectionsSection from "@/components/connections/NewConnectionsSection";
import NextMatchesMessage from "@/components/connections/NextMatchesMessage";
import OnboardingWelcome from "@/components/connections/OnboardingWelcome";
import ProfileInsightsDashboard from "@/components/connections/ProfileInsightsDashboard";
import AccountConnectionButtons from "@/components/connections/AccountConnectionButtons";

const Connections = () => {
  // Sample profile data for the dashboard
  const sampleProfileData = {
    vibeSummary: "We don't have enough info on that yet.",
    oneLiner: "We don't have enough info on that yet.",
    location: "We don't have enough info on that yet.",
    age: "We don't have enough info on that yet.",
    job: "We don't have enough info on that yet.",
    school: "We don't have enough info on that yet.",
    interests: "We don't have enough info on that yet.",
    socialStyle: "We don't have enough info on that yet.",
    lifestyle: "We don't have enough info on that yet.",
    favoriteActivities: "We don't have enough info on that yet.",
    communicationStyle: "We don't have enough info on that yet.",
    coreValues: "We don't have enough info on that yet.",
    lifePhilosophy: "We don't have enough info on that yet.",
    goals: "We don't have enough info on that yet.",
    favoriteMusic: "We don't have enough info on that yet.",
    favoriteMoviesAndShows: "We don't have enough info on that yet.",
    favoriteBooks: "We don't have enough info on that yet.",
    connectionPreferences: "We don't have enough info on that yet.",
    twyneTags: []
  };

  // Empty connections array for now
  const connections: any[] = [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Connections</h1>
      
      {/* Account Connection Buttons */}
      <AccountConnectionButtons />
      
      {/* Profile Insights Dashboard */}
      <ProfileInsightsDashboard profileData={sampleProfileData} nameInitial="U" />
      
      {/* Onboarding Welcome */}
      <OnboardingWelcome />
      
      {/* New Connections Section */}
      <NewConnectionsSection connections={connections} />
      
      {/* Next Matches Message */}
      <NextMatchesMessage />
    </div>
  );
};

export default Connections;
