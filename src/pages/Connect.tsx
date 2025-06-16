
import React, { useState, useEffect } from "react";
import { MessageCircle, X, Users, Heart, MapPin, Sparkles, Clock } from "lucide-react";
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
  mutuals: Array<{ name: string; avatar: string }>;
  connectionDegrees: number;
}

// AI Avatar component using DiceBear API
const AIAvatar = ({ name, size = 48 }: { name: string; size?: number }) => {
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  
  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm ring-1 ring-white/20`} style={{ width: size, height: size }}>
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
  const [loadingStage, setLoadingStage] = useState<'generating' | 'finalizing' | 'complete'>('generating');

  useEffect(() => {
    const generateIntros = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoadingStage('generating');
        
        // Set a timeout for AI generation
        const timeoutId = setTimeout(() => {
          console.log('Intro generation timeout, using fallback');
          setSampleIntros(getFallbackIntros());
          setLoadingStage('complete');
          setLoading(false);
        }, 3000);

        const { data, error } = await supabase.functions.invoke('generate-intros', {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        clearTimeout(timeoutId);
        setLoadingStage('finalizing');

        if (error) {
          console.error('Error generating intros:', error);
          setSampleIntros(getFallbackIntros());
        } else if (data?.scenarios) {
          const intros = data.scenarios.map((scenario: any, index: number) => ({
            id: (index + 1).toString(),
            introText: scenario.introText,
            avatar: <AIAvatar name={scenario.name} size={48} />,
            tags: scenario.tags,
            name: scenario.name,
            mutuals: generateMockMutuals(index),
            connectionDegrees: Math.floor(Math.random() * 4) + 1
          }));
          setSampleIntros(intros);
        } else {
          setSampleIntros(getFallbackIntros());
        }
      } catch (error) {
        console.error('Exception generating intros:', error);
        setSampleIntros(getFallbackIntros());
      } finally {
        setLoadingStage('complete');
        setLoading(false);
      }
    };

    generateIntros();
  }, [user]);

  const generateMockMutuals = (index: number): Array<{ name: string; avatar: string }> => {
    if (index === 0) {
      return [
        { name: "Maya", avatar: "M" },
        { name: "James", avatar: "J" }
      ];
    } else if (index === 2) {
      return [
        { name: "Chris", avatar: "C" }
      ];
    }
    return [];
  };

  const getFallbackIntros = (): SampleIntro[] => [
    {
      id: "1",
      introText: "You both recently moved to a new city and care deeply about growth over goals.",
      avatar: <AIAvatar name="Alex" size={48} />,
      tags: ["Big dreamer", "Recently moved", "Growth mindset"],
      name: "Alex",
      mutuals: [
        { name: "Maya", avatar: "M" },
        { name: "James", avatar: "J" }
      ],
      connectionDegrees: 2
    },
    {
      id: "2", 
      introText: "You share a love for deep conversations and both value authenticity over small talk.",
      avatar: <AIAvatar name="Sam" size={48} />,
      tags: ["Introspective extrovert", "Deep thinker", "Authentic"],
      name: "Sam",
      mutuals: [],
      connectionDegrees: 3
    },
    {
      id: "3",
      introText: "You both find energy in creative projects and believe in following your curiosity.",
      avatar: <AIAvatar name="Jordan" size={48} />,
      tags: ["Creative soul", "Curious explorer", "Project lover"],
      name: "Jordan",
      mutuals: [
        { name: "Chris", avatar: "C" }
      ],
      connectionDegrees: 1
    }
  ];

  const handleConnect = (cardId: string) => {
    setConnectedCards(prev => new Set([...prev, cardId]));
  };

  const handleSkip = (cardId: string) => {
    setSkippedCards(prev => new Set([...prev, cardId]));
  };

  const ConnectSuccessMessage = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl bg-white/95 backdrop-blur-md">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfect match!</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              If this were a real match, you'd start chatting here. You'll get real intros like this after setup.
            </p>
          </div>
          <Button onClick={onClose} className="w-full h-10 text-sm font-medium rounded-xl">
            Got it
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-ping"></div>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {loadingStage === 'generating' && 'Crafting your introductions...'}
            {loadingStage === 'finalizing' && 'Finalizing matches...'}
          </h1>
          
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            We're personalizing connections based on your unique vibe and values
          </p>

          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex flex-col px-4 py-4">
          {/* Header Section - Compact */}
          <div className="text-center mb-4 flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-2">
              <Clock className="w-3 h-3" />
              Weekly Monday Previews
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              Your personalized
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> introductions</span>
            </h1>
            
            <div className="max-w-xl mx-auto">
              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                These connections are crafted based on your authentic vibe, values, and story.
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Fresh introductions arrive every Monday morning
              </p>
            </div>
          </div>

          {/* Cards Grid - Flexible */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {sampleIntros.map((intro, index) => {
                  const isConnected = connectedCards.has(intro.id);
                  const isSkipped = skippedCards.has(intro.id);
                  
                  return (
                    <Card 
                      key={intro.id} 
                      className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-md ${
                        isConnected ? 'ring-2 ring-primary shadow-lg shadow-primary/20 bg-primary/5' : 
                        isSkipped ? 'opacity-60 scale-95 bg-gray-50' : 
                        'hover:shadow-lg hover:bg-white'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <CardContent className="relative p-3 h-full flex flex-col">
                        {/* Avatar and Name Section */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative">
                            {intro.avatar}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 mb-0.5">{intro.name}</h3>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="w-3 h-3 mr-1" />
                              Seattle, WA
                            </div>
                          </div>
                        </div>

                        {/* Intro Text */}
                        <div className="relative mb-3 flex-1">
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-lg p-2 border border-gray-100">
                            <p className="text-gray-800 leading-relaxed text-xs font-medium">
                              You and {intro.name} {intro.introText.replace(/^You (and|both|share)/, '').trim()}
                            </p>
                          </div>
                        </div>

                        {/* Connection Info */}
                        <div className="mb-3">
                          {intro.mutuals.length > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center text-xs font-medium text-gray-700">
                                <Users className="w-3 h-3 mr-1 text-primary" />
                                Mutual connections
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-1">
                                  {intro.mutuals.map((mutual, i) => (
                                    <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-white flex items-center justify-center text-xs font-semibold text-primary shadow-sm">
                                      {mutual.avatar}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600 font-medium">
                                  {intro.mutuals.map(m => m.name).join(', ')}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center text-xs text-gray-500">
                              <div className="w-1 h-1 bg-gradient-to-r from-primary to-accent rounded-full mr-2"></div>
                              <span className="font-medium">{intro.connectionDegrees} {intro.connectionDegrees === 1 ? 'degree' : 'degrees'} of connection away</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {intro.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 px-2 py-0.5 text-xs font-medium hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Action buttons */}
                        {!isConnected && !isSkipped && (
                          <div className="space-y-2 mt-auto">
                            <Button 
                              onClick={() => handleConnect(intro.id)}
                              className="w-full h-8 text-xs font-medium rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Connect & Say Hi
                            </Button>
                            <Button 
                              onClick={() => handleSkip(intro.id)}
                              variant="outline" 
                              className="w-full h-6 text-xs rounded-lg text-gray-600 border-gray-200 hover:bg-gray-50 transition-all"
                            >
                              Not feeling it
                            </Button>
                          </div>
                        )}

                        {/* Status indicators */}
                        {isConnected && (
                          <div className="text-center py-2 mt-auto">
                            <div className="inline-flex items-center gap-1 text-primary font-semibold bg-primary/10 px-2 py-1 rounded-lg text-xs">
                              <Heart className="w-3 h-3" />
                              Connected!
                            </div>
                          </div>
                        )}

                        {isSkipped && (
                          <div className="text-center py-2 mt-auto">
                            <div className="inline-flex items-center gap-1 text-gray-500 font-medium text-xs">
                              <X className="w-3 h-3" />
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
          </div>

          {/* Footer Message - Compact */}
          <div className="text-center flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-primary" />
              <p className="text-gray-700 font-medium text-xs">
                Not feeling it? Skipping helps us get smarter about your preferences
              </p>
            </div>
          </div>

          {/* Success modal */}
          {connectedCards.size > 0 && (
            <ConnectSuccessMessage 
              onClose={() => setConnectedCards(new Set())} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Connect;
