
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleAuthService } from "@/services/googleAuthService";
import { Loader2 } from "lucide-react";

const GoogleAuthTest = () => {
  const [testData, setTestData] = useState({
    name: 'Test User',
    age: '25',
    interests: 'Reading, Gaming, Sports'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if we have user data after OAuth
    if (user) {
      console.log('🔍 GoogleAuthTest: User found after OAuth');
      console.log('📊 GoogleAuthTest: User metadata:', user.user_metadata);
      console.log('📊 GoogleAuthTest: App metadata:', user.app_metadata);
    }
  }, [user]);

  const handleTestGoogleAuth = async () => {
    console.log('🚀 GoogleAuthTest: Starting simplified OAuth test');
    setIsLoading(true);

    try {
      // Prepare test data as onboarding data
      const testProfile = {
        name: testData.name,
        age: testData.age,
        interestsAndPassions: testData.interests,
        // Add minimal required fields
        vibeSummary: "Test user profile",
        oneLiner: "Testing Google OAuth flow",
        twyneTags: ["test", "oauth"],
        // Add other required fields with defaults
        location: "",
        job: "",
        school: "",
        ethnicity: "",
        religion: "",
        hometown: "",
        lifestyle: "",
        favoriteProducts: "",
        style: "",
        favoriteMoviesAndShows: "",
        favoriteMusic: "",
        favoriteBooks: "",
        favoritePodcastsOrYouTube: "",
        talkingPoints: [],
        favoriteActivities: "",
        favoriteSpots: "",
        coreValues: "",
        lifePhilosophy: "",
        goals: "",
        personalitySummary: "",
        bigFiveTraits: {
          openness: "",
          conscientiousness: "",
          extraversion: "",
          agreeableness: "",
          neuroticism: ""
        },
        quirks: "",
        communicationStyle: "",
        upbringing: "",
        majorTurningPoints: "",
        recentLifeContext: "",
        socialStyle: "",
        loveLanguageOrFriendStyle: "",
        socialNeeds: "",
        connectionPreferences: "",
        dealBreakers: "",
        boundariesAndPetPeeves: "",
        connectionActivities: ""
      };
      
      const testConversation = {
        messages: [
          { role: "system", content: "Test conversation" },
          { role: "user", content: "This is a test message" },
          { role: "assistant", content: "This is a test response" }
        ],
        userAnswers: ["This is a test message"]
      };
      
      console.log('💾 GoogleAuthTest: Test data prepared:', {
        profileName: testProfile.name,
        conversationMessageCount: testConversation.messages.length
      });
      
      // Use the new Google auth service with test data
      await GoogleAuthService.initiateGoogleAuth({
        profile: testProfile,
        conversation: testConversation,
        userName: testData.name,
        promptMode: 'structured'
      });
      
      // OAuth flow will handle the redirect automatically
      
    } catch (error) {
      console.error('❌ GoogleAuthTest: Error in test:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Google OAuth Data Preservation Test (Simplified)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user ? (
              <>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    This test validates that we can preserve data through Google OAuth using Supabase's native flow.
                    Enter some test data below, then sign in with Google.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Test Name</Label>
                      <Input
                        id="name"
                        value={testData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter test name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Test Age</Label>
                      <Input
                        id="age"
                        value={testData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="Enter test age"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="interests">Test Interests</Label>
                      <Input
                        id="interests"
                        value={testData.interests}
                        onChange={(e) => handleInputChange('interests', e.target.value)}
                        placeholder="Enter test interests"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleTestGoogleAuth}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting OAuth flow...
                    </>
                  ) : (
                    'Test Google OAuth with Data Preservation'
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">
                  ✅ Authentication Successful!
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>User Email:</Label>
                    <p className="text-sm bg-muted p-2 rounded">{user.email}</p>
                  </div>
                  
                  <div>
                    <Label>User ID:</Label>
                    <p className="text-sm bg-muted p-2 rounded font-mono">{user.id}</p>
                  </div>
                  
                  <div>
                    <Label>User Metadata:</Label>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(user.user_metadata, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <Label>App Metadata:</Label>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(user.app_metadata, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    window.location.href = '/google-auth-test';
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Test Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/'}
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthTest;
