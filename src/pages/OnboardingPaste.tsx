
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import type { UserProfile, Conversation } from '@/types/chat';
import type { Json } from '@/integrations/supabase/types';

const OnboardingPaste = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleValidateData = () => {
    if (!onboardingData.trim()) {
      toast({
        title: "No data provided",
        description: "Please paste your onboarding data to validate.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = JSON.parse(onboardingData);
      
      // Validate that the data has the expected structure
      if (!data.profile || !data.conversation) {
        throw new Error("Invalid data format. Expected profile and conversation data.");
      }

      setParsedData(data);
      setCurrentStep(2);
      
      toast({
        title: "Data validated successfully!",
        description: "Your onboarding data format is correct.",
      });
    } catch (error) {
      console.error('Error validating onboarding data:', error);
      
      let errorMessage = 'Invalid data format. Please check your data and try again.';
      if (error instanceof SyntaxError) {
        errorMessage = 'Invalid JSON format. Please check your data and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Validation failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!parsedData) {
      toast({
        title: "No validated data",
        description: "Please validate your data first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate a temporary ID for storage
      const tempId = crypto.randomUUID();
      
      // Store in onboarding_data table without user_id and is_anonymous columns
      const { error: insertError } = await supabase
        .from('onboarding_data')
        .insert({
          id: tempId,
          profile_data: parsedData.profile as Json,
          onboarding_conversation: parsedData.conversation as Json,
          onboarding_mode: parsedData.promptMode || 'structured'
        });

      if (insertError) {
        console.error('Error storing onboarding data:', insertError);
        throw insertError;
      }

      // Store temp ID for later retrieval
      localStorage.setItem('temp_onboarding_id', tempId);

      console.log('Successfully imported and stored onboarding data:', {
        hasProfile: !!parsedData.profile,
        hasConversation: !!parsedData.conversation,
        onboardingMode: parsedData.promptMode || 'structured'
      });

      setCurrentStep(3);
      
      toast({
        title: "Data imported successfully!",
        description: "Your onboarding data has been loaded.",
      });

    } catch (error) {
      console.error('Error importing onboarding data:', error);
      
      let errorMessage = 'Failed to import data. Please try again.';
      if (error instanceof Error) {
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

  const handleComplete = () => {
    // Navigate to results page to show the imported data
    navigate('/onboarding-results', {
      state: {
        userProfile: parsedData.profile as UserProfile,
        userName: parsedData.userName || '',
        conversation: parsedData.conversation as Conversation
      }
    });
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Step 1: Paste Your Data
        </CardTitle>
        <CardDescription>
          Paste your exported onboarding data below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="onboarding-data" className="block text-sm font-medium mb-2">
            Onboarding data (JSON format)
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
            onClick={handleValidateData}
            disabled={!onboardingData.trim()}
            className="flex-1"
          >
            Validate Data
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setOnboardingData('')}
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
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Step 2: Review & Import
        </CardTitle>
        <CardDescription>
          Your data has been validated. Review the details below and import when ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded">
            <h4 className="font-medium text-sm mb-2">Profile Data</h4>
            <p className="text-xs text-muted-foreground">
              Name: {parsedData?.profile?.name || 'Not specified'}
            </p>
            <p className="text-xs text-muted-foreground">
              Location: {parsedData?.profile?.location || 'Not specified'}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <h4 className="font-medium text-sm mb-2">Conversation Data</h4>
            <p className="text-xs text-muted-foreground">
              Messages: {parsedData?.conversation?.messages?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Mode: {parsedData?.promptMode || 'structured'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleImport}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Importing...' : 'Import Data'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(1)}
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Step 3: Import Complete
        </CardTitle>
        <CardDescription>
          Your onboarding data has been successfully imported and is ready to use.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Import Successful!</h3>
          <p className="text-muted-foreground mb-4">
            Your onboarding data has been imported and stored. You can now continue to your results.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleComplete}
            className="flex-1"
          >
            Continue to Results
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentStep(1);
              setParsedData(null);
              setOnboardingData('');
            }}
          >
            Import Another
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-px mx-2 ${
                        step < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default OnboardingPaste;
