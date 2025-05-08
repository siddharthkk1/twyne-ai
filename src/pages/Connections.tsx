
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingWelcome from "@/components/connections/OnboardingWelcome";
import ProfileInsightsDashboard from "@/components/connections/ProfileInsightsDashboard";
import NewConnectionsSection from "@/components/connections/NewConnectionsSection";
import NextMatchesMessage from "@/components/connections/NextMatchesMessage";
import { getMockConnections } from "@/services/connectionService";

const Connections = () => {
  const { user } = useAuth();

  // Check if the user has just completed onboarding
  const isNewlyOnboarded = user?.user_metadata?.has_onboarded === true && 
                          (!user?.user_metadata?.received_first_matches);

  // Only show connections for returning users who have received matches
  const connections = isNewlyOnboarded ? [] : getMockConnections();
  const newConnections = connections.filter((c) => c.isNew);
  const pastConnections = connections.filter((c) => !c.isNew);

  // Get first letter of name for avatar placeholder
  const nameInitial = user?.user_metadata?.profile_data?.name 
    ? user.user_metadata.profile_data.name[0] 
    : user?.email?.[0] || "?";
    
  // Get profile data from user metadata
  const profileData = user?.user_metadata?.profile_data || {};

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-2xl font-semibold">Connections</h1>

      {isNewlyOnboarded ? (
        // Show welcome message for newly onboarded users
        <div className="space-y-6">
          <OnboardingWelcome />
          <ProfileInsightsDashboard 
            profileData={profileData}
            nameInitial={nameInitial}
          />
        </div>
      ) : (
        <>
          <NewConnectionsSection connections={newConnections} />
          <NextMatchesMessage />
        </>
      )}
    </div>
  );
};

export default Connections;
