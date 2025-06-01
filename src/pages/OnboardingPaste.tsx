
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Upload } from 'lucide-react';
import type { UserProfile, Conversation } from '@/types/chat';
import type { Json } from '@/integrations/supabase/types';

const OnboardingPaste = () => {
  const navigate = useNavigate();
  const [onboardingData, setOnboardingData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!onboardingData.trim()) {
      toast({
        title: "No data provided",
        description: "Please paste your onboarding data to import.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Parse the pasted data
      const parsedData = JSON.parse(onboardingData);
      
      // Validate that the data has the expected structure
      if (!parsedData.profile || !parsedData.conversation) {
        throw new Error("Invalid data format. Expected profile and conversation data.");
      }

      // Generate a temporary ID for anonymous storage
      const tempId = crypto.randomUUID();
      
      // Store in onboarding_data table for anonymous users
      const { error: insertError } = await supabase
        .from('onboarding_data')
        .insert({
          id: tempId,
          user_id: tempId,
          profile_data: parsedData.profile as Json,
          onboarding_conversation: parsedData.conversation as Json,
          onboarding_mode: parsedData.promptMode || 'structured',
          is_anonymous: true
        });

      if (insertError) {
        console.error('Error storing onboarding data:', insertError);
        throw insertError;
      }

      // Store temp ID for later retrieval
      localStorage.setItem('temp_onboarding_id', tempId);

      // Retrieve the stored data to verify
      const { data: storedData, error: fetchError } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('id', tempId)
        .single();

      if (fetchError) {
        console.error('Error fetching stored data:', fetchError);
        throw fetchError;
      }

      console.log('Successfully imported and stored onboarding data:', {
        hasProfile: !!storedData.profile_data,
        hasConversation: !!storedData.onboarding_conversation,
        onboardingMode: storedData.onboarding_mode
      });

      toast({
        title: "Data imported successfully!",
        description: "Your onboarding data has been loaded. You can now create an account or sign in.",
      });

      // Navigate to results page to show the imported data
      navigate('/onboarding-results', {
        state: {
          userProfile: parsedData.profile as UserProfile,
          userName: parsedData.userName || '',
          conversation: parsedData.conversation as Conversation
        }
      });

    } catch (error) {
      console.error('Error importing onboarding data:', error);
      
      let errorMessage = 'Failed to import data. Please check the format and try again.';
      if (error instanceof SyntaxError) {
        errorMessage = 'Invalid JSON format. Please check your data and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/onboarding')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Onboarding
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Onboarding Data
            </CardTitle>
            <CardDescription>
              If you have previously exported your onboarding data, you can import it here to continue where you left off.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="onboarding-data" className="block text-sm font-medium mb-2">
                Paste your onboarding data (JSON format)
              </label>
              <Textarea
                id="onboarding-data"
                placeholder='Paste your exported onboarding data here, e.g., {"profile": {...}, "conversation": {...}, ...}'
                value={onboardingData}
                onChange={(e) => setOnboardingData(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleImport}
                disabled={isLoading || !onboardingData.trim()}
                className="flex-1"
              >
                {isLoading ? 'Importing...' : 'Import Data'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setOnboardingData('')}
                disabled={isLoading}
              >
                Clear
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
              <p className="font-medium mb-1">Expected format:</p>
              <pre className="text-xs">
{`{
  "profile": { ... },
  "conversation": { ... },
  "userName": "...",
  "promptMode": "..."
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPaste;
