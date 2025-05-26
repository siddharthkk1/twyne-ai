
import React from "react";
import ConnectionCard from "@/components/connections/ConnectionCard";
import NewConnectionsSection from "@/components/connections/NewConnectionsSection";
import NextMatchesMessage from "@/components/connections/NextMatchesMessage";
import OnboardingWelcome from "@/components/connections/OnboardingWelcome";
import ProfileInsightsDashboard from "@/components/connections/ProfileInsightsDashboard";
import AccountConnectionButtons from "@/components/connections/AccountConnectionButtons";

const Connections = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Connections</h1>
      
      {/* Account Connection Buttons */}
      <AccountConnectionButtons />
      
      {/* Profile Insights Dashboard */}
      <ProfileInsightsDashboard />
      
      {/* Onboarding Welcome */}
      <OnboardingWelcome />
      
      {/* New Connections Section */}
      <NewConnectionsSection />
      
      {/* Next Matches Message */}
      <NextMatchesMessage />
    </div>
  );
};

export default Connections;
