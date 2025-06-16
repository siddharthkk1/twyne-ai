
import React, { useState, useEffect } from "react";
import { MessageCircle, X, Users, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SampleIntro {
  id: string;
  introText: string;
  avatar: React.ReactNode;
  tags: string[];
  name: string;
}

// AI Avatar component using DiceBear API
const AIAvatar = ({ name, size = 64 }: { name: string; size?: number }) => {
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  
  return (
    <div className={`rounded-full overflow-hidden`} style={{ width: size, height: size }}>
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const Connect = () => {
  const { user } = useAuth();
  const [connectedCards, setConnectedCards] = useState<Set<string>>(new Set());
  const [skippedCards, setSkippedCards] = useState<Set<string>>(new Set());
  const [sampleIntros, setSampleIntros] = useState<SampleIntro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateIntros = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('generate-intros', {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        if (error) {
          console.error('Error generating intros:', error);
          // Use fallback intros
          setSampleIntros(getFallbackIntros());
        } else if (data?.scenarios) {
          const intros = data.scenarios.map((scenario: any, index: number) => ({
            id: (index + 1).toString(),
            introText: scenario.introText,
            avatar: <AIAvatar name={scenario.name} size={64} />,
            tags: scenario.tags,
            name: scenario.name
          }));
          setSampleIntros(intros);
        } else {
          setSampleIntros(getFallbackIntros());
        }
      } catch (error) {
        console.error('Exception generating intros:', error);
        setSampleIntros(getFallbackIntros());
      } finally {
        setLoading(false);
      }
    };

    generateIntros();
  }, [user]);

  const getFallbackIntros = (): SampleIntro[] => [
    {
      id: "1",
      introText: "You both recently moved to a new city and care deeply about growth over goals.",
      avatar: <AIAvatar name="Alex" size={64} />,
      tags: ["Big dreamer", "Recently moved", "Growth mindset"],
      name: "Alex"
    },
    {
      id: "2", 
      introText: "You share a love for deep conversations and both value authenticity over small talk.",
      avatar: <AIAvatar name="Sam" size={64} />,
      tags: ["Introspective extrovert", "Deep thinker", "Authentic"],
      name: "Sam"
    },
    {
      id: "3",
      introText: "You both find energy in creative projects and believe in following your curiosity.",
      avatar: <AIAvatar name="Jordan" size={64} />,
      tags: ["Creative soul", "Curious explorer", "Project lover"],
      name: "Jordan"
    }
  ];

  const handleConnect = (cardId: string) => {
    setConnectedCards(prev => new Set([...prev, cardId]));
  };

  const handleSkip = (cardId: string) => {
    setSkippedCards(prev => new Set([...prev, cardId]));
  };

  const ConnectSuccessMessage = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Heart className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Nice choice!</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            If this were a real match, you'd start chatting here. You'll get real intros like this after setup.
          </p>
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            Generating your personalized introductions...
          </h1>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Here's a sample of what your weekly introductions might feel like.
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          These examples are based on what we've learned about your vibe, values, and story so far. 
          Your real matches will evolve over time as we get to know you better.
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          {sampleIntros.map((intro) => {
            const isConnected = connectedCards.has(intro.id);
            const isSkipped = skippedCards.has(intro.id);
            
            return (
              <Card 
                key={intro.id} 
                className={`relative transition-all duration-300 ${
                  isConnected ? 'ring-2 ring-primary bg-primary/5' : 
                  isSkipped ? 'opacity-50 bg-muted/50' : 
                  'hover:shadow-md'
                }`}
              >
                <CardContent className="p-6">
                  {/* Avatar and basic info */}
                  <div className="flex items-center space-x-4 mb-4">
                    {intro.avatar}
                    <div>
                      <h3 className="font-medium">{intro.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin size={14} className="mr-1" />
                        In your city
                      </div>
                    </div>
                  </div>

                  {/* Intro text */}
                  <div className="bg-muted rounded-xl p-4 mb-4">
                    <p className="text-sm leading-relaxed">
                      <span className="font-medium">Why you might click:</span>{" "}
                      {intro.introText}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {intro.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action buttons */}
                  {!isConnected && !isSkipped && (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleConnect(intro.id)}
                        className="w-full rounded-full"
                        size="sm"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Connect
                      </Button>
                      <Button 
                        onClick={() => handleSkip(intro.id)}
                        variant="outline" 
                        className="w-full rounded-full text-muted-foreground"
                        size="sm"
                      >
                        Not feeling it
                      </Button>
                    </div>
                  )}

                  {/* Status indicators */}
                  {isConnected && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center text-primary font-medium">
                        <Heart size={16} className="mr-2" />
                        Connected!
                      </div>
                    </div>
                  )}

                  {isSkipped && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center text-muted-foreground">
                        <X size={16} className="mr-2" />
                        Skipped
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Helper text */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Not feeling it? That's totally fine—skipping helps us get smarter about your taste.
        </p>
      </div>

      {/* Success modal */}
      {connectedCards.size > 0 && (
        <ConnectSuccessMessage 
          onClose={() => setConnectedCards(new Set())} 
        />
      )}
    </div>
  );
};

export default Connect;
