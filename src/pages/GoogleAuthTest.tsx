
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
    console.log('🚀 GoogleAuthTest: Starting validation test');
    setIsLoading(true);

    try {
      // Store test data in localStorage (simulating onboarding data)
      const testDataString = JSON.stringify(testData);
      localStorage.setItem('oauth_test_data', testDataString);
      
      console.log('💾 GoogleAuthTest: Test data stored:', testData);
      console.log('📍 GoogleAuthTest: Current URL before OAuth:', window.location.href);
      
      // Get the auth URL and redirect
      const authUrl = GoogleAuthService.getYouTubeAuthUrl();
      console.log('🔗 GoogleAuthTest: Redirecting to Google OAuth:', authUrl);
      
      window.location.href = authUrl;
      
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
              Google OAuth Data Preservation Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user ? (
              <>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    This test validates that we can preserve data through Google OAuth flow.
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
                      Redirecting to Google...
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
                  
                  <div>
                    <Label>Test Data from localStorage:</Label>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {localStorage.getItem('oauth_test_data') || 'No test data found'}
                    </pre>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    localStorage.removeItem('oauth_test_data');
                    window.location.href = '/google-auth-test';
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Data & Test Again
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
