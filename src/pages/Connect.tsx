
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Users, CheckCircle, MapPin, Sparkles, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AIAvatar } from "@/components/connect/AIAvatar";

interface SampleIntro {
  id: string;
  introText: string;
  avatar: React.ReactNode;
  tags: string[];
  name: string;
  mutuals: Array<{ name: string; avatar: string }>;
  connectionDegrees: number;
}

const Connect = () => {
  const { user } = useAuth();
  const [connectedCards, setConnectedCards] = useState<Set<string>>(new Set());
  const [skippedCards, setSkippedCards] = useState<Set<string>>(new Set());
  const [sampleIntros, setSampleIntros] = useState<SampleIntro[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'generating' | 'finalizing' | 'complete'>('generating');
  
  // Track if intros have been generated for this session and prevent tab switching regeneration
  const introsGeneratedRef = useRef<string | null>(null);
  const hasNavigatedAwayRef = useRef(false);
  const selectedAvatarIdsRef = useRef<string[]>([]);

  // Add logging for state changes
  useEffect(() => {
    console.log('🔄 sampleIntros state changed:', {
      length: sampleIntros.length,
      intros: sampleIntros.map(intro => ({ id: intro.id, name: intro.name }))
    });
  }, [sampleIntros]);

  useEffect(() => {
    console.log('🔄 loading state changed:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('🔄 loadingStage state changed:', loadingStage);
  }, [loadingStage]);

  useEffect(() => {
    console.log('🔄 connectedCards state changed:', Array.from(connectedCards));
  }, [connectedCards]);

  useEffect(() => {
    console.log('🔄 skippedCards state changed:', Array.from(skippedCards));
  }, [skippedCards]);

  // Handle tab visibility changes to prevent regeneration when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Tab became hidden, marking as navigated away');
        hasNavigatedAwayRef.current = true;
      } else {
        console.log('👁️ Tab became visible, navigated away status:', hasNavigatedAwayRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const generateIntros = async () => {
      console.log('🚀 === CHECKING IF INTROS NEED GENERATION ===');
      console.log('📊 Generation check state:', {
        userId: user?.id,
        introsGeneratedForUser: introsGeneratedRef.current,
        currentIntrosLength: sampleIntros.length,
        hasNavigatedAway: hasNavigatedAwayRef.current
      });

      if (!user) {
        console.log('❌ No user found, stopping generation');
        setLoading(false);
        return;
      }

      // Only generate if we haven't generated for this user in this session
      const shouldGenerate = introsGeneratedRef.current !== user.id;

      if (!shouldGenerate) {
        console.log('✅ Intros already generated for this user session, skipping generation');
        setLoading(false);
        return;
      }

      console.log('🚀 === STARTING INTRO GENERATION ===');
      console.log('📊 Initial state:', {
        sampleIntrosLength: sampleIntros.length,
        connectedCardsSize: connectedCards.size,
        skippedCardsSize: skippedCards.size,
        loading,
        loadingStage,
        userId: user?.id
      });
      
      console.log('🧹 Clearing all state immediately...');
      
      // Reset ALL state immediately and synchronously
      setSampleIntros([]);
      setConnectedCards(new Set());
      setSkippedCards(new Set());
      setLoading(true);
      setLoadingStage('generating');
      
      console.log('✅ State clearing commands sent');

      try {
        console.log('🤖 Starting AI intro generation for user:', user.id);
        console.log('📡 Calling supabase generate-intros function...');
        
        const { data, error } = await supabase.functions.invoke('generate-intros', {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        console.log('📡 Supabase function call completed');
        setLoadingStage('finalizing');

        if (error) {
          console.error('❌ Error generating intros:', error);
          console.log('🔄 Setting fallback intros due to error');
          setSampleIntros(getFallbackIntros());
        } else if (data?.scenarios) {
          console.log('✅ Successfully generated intros:', data.scenarios);
          const intros = data.scenarios.map((scenario: any, index: number) => ({
            id: (index + 1).toString(),
            introText: scenario.introText,
            avatar: <AIAvatar name={scenario.name} size={80} avatarId={getRandomAvatarId(index)} />,
            tags: scenario.tags,
            name: scenario.name,
            mutuals: generateMockMutuals(index),
            connectionDegrees: Math.floor(Math.random() * 4) + 1
          }));
          console.log('🔄 Setting new generated intros:', intros.map(i => ({ id: i.id, name: i.name })));
          setSampleIntros(intros);
        } else {
          console.log('⚠️ No scenarios in response, using fallback');
          console.log('🔄 Setting fallback intros due to missing scenarios');
          setSampleIntros(getFallbackIntros());
        }

        // Mark that intros have been generated for this user session
        introsGeneratedRef.current = user.id;

      } catch (error) {
        console.error('💥 Exception generating intros:', error);
        console.log('🔄 Setting fallback intros due to exception');
        setSampleIntros(getFallbackIntros());
        
        // Still mark as generated to prevent retry loops
        introsGeneratedRef.current = user.id;
      } finally {
        console.log('🏁 Finalizing intro generation...');
        setLoadingStage('complete');
        setLoading(false);
        console.log('🚀 === INTRO GENERATION COMPLETE ===');
      }
    };

    generateIntros();
  }, [user?.id]); // Only depend on user ID

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

  // Function to randomly select 3 avatar IDs from the available 8
  const selectRandomAvatarIds = (): string[] => {
    const allAvatarIds = [
      "684f8c5a28e0929137f65a83",
      "684f8ca2227a9a04221373e3", 
      "684f8bb91973186246f39d35",
      "684f8d64701a61ea77c9c61a",
      "684f90c45ff6c5b890403161",
      "684f910438f22dcb7d853a89",
      "684f913228e0929137f6b568",
      "684f91b5701a61ea77ca177c"
    ];
    
    // Shuffle array and take first 3
    const shuffled = [...allAvatarIds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Function to get avatar ID for a specific index, using randomly selected IDs
  const getRandomAvatarId = (index: number): string => {
    // Initialize random selection if not done yet
    if (selectedAvatarIdsRef.current.length === 0) {
      selectedAvatarIdsRef.current = selectRandomAvatarIds();
      console.log('🎲 Selected random avatar IDs:', selectedAvatarIdsRef.current);
    }
    
    return selectedAvatarIdsRef.current[index % selectedAvatarIdsRef.current.length];
  };

  const getFallbackIntros = (): SampleIntro[] => {
    console.log('🔧 Generating fallback intros');
    return [
      {
        id: "1",
        introText: "You both recently moved to a new city and care deeply about growth over goals.",
        avatar: <AIAvatar name="Alex" size={80} avatarId={getRandomAvatarId(0)} />,
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
        avatar: <AIAvatar name="Sam" size={80} avatarId={getRandomAvatarId(1)} />,
        tags: ["Introspective extrovert", "Deep thinker", "Authentic"],
        name: "Sam",
        mutuals: [],
        connectionDegrees: 3
      },
      {
        id: "3",
        introText: "You both find energy in creative projects and believe in following your curiosity.",
        avatar: <AIAvatar name="Jordan" size={80} avatarId={getRandomAvatarId(2)} />,
        tags: ["Creative soul", "Curious explorer", "Project lover"],
        name: "Jordan",
        mutuals: [
          { name: "Chris", avatar: "C" }
        ],
        connectionDegrees: 1
      }
    ];
  };

  const handleConnect = (cardId: string) => {
    console.log('💖 Connecting to card:', cardId);
    setConnectedCards(prev => new Set([...prev, cardId]));
  };

  const handleSkip = (cardId: string) => {
    console.log('⏭️ Skipping card:', cardId);
    setSkippedCards(prev => new Set([...prev, cardId]));
  };

  const ConnectSuccessMessage = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl bg-white/95 backdrop-blur-md">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection sent!</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Great choice! In the real app, this would start a conversation. You'll get thoughtful intros like this when Twyne launches.
            </p>
          </div>
          <Button onClick={onClose} className="w-full h-10 text-sm font-medium rounded-xl">
            Got it
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Add logging for render conditions
  console.log('🖼️ RENDER CONDITIONS:', {
    loading,
    sampleIntrosLength: sampleIntros.length,
    willRenderCards: !loading && sampleIntros.length > 0,
    willShowLoading: loading
  });

  if (loading) {
    console.log('🔄 Rendering loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center pt-16">
        <div className="text-center max-w-3xl mx-auto px-8 py-16">
          <div className="relative mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full animate-ping"></div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
            {loadingStage === 'generating' && 'Crafting your introductions...'}
            {loadingStage === 'finalizing' && 'Finalizing matches...'}
          </h1>
          
          <p className="text-lg text-gray-600 mb-16 leading-relaxed max-w-2xl mx-auto">
            We're personalizing connections based on your unique vibe and values
          </p>

          <div className="flex items-center justify-center space-x-3">
            <div className="flex space-x-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('🖼️ Rendering main content with cards');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-16 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Sample Notice - Compact */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl text-sm font-medium mb-6 shadow-sm">
            <Info className="w-4 h-4" />
            <span>Sample Preview: These are examples of the personalized introductions you'll receive. When Twyne launches in Seattle, these will be actual Twyne users.</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Your personalized
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> introductions</span>
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed font-medium">
              These connections are crafted based on your authentic vibe, values, and story.
            </p>
            <p className="text-sm text-gray-500 font-medium mt-2">
              Fresh warm intros arrive every Monday morning
            </p>
          </div>
        </div>

        {/* Cards Grid - Only render when we have intros and not loading */}
        {sampleIntros.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {sampleIntros.map((intro, index) => {
              console.log('🎴 Rendering card:', { id: intro.id, name: intro.name, index });
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
                  style={{ minHeight: "480px" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardContent className="relative p-6 h-full flex flex-col">
                    {/* Avatar and Name Layout - Square avatar on left, name/city on right */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative flex-shrink-0">
                        {intro.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{intro.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          Seattle, WA
                        </div>
                      </div>
                    </div>

                    {/* Intro Text */}
                    <div className="relative mb-6 flex-1">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-4 border border-gray-100">
                        <p className="text-gray-800 leading-relaxed text-base font-medium">
                          You and {intro.name} {intro.introText.replace(/^You (and|both|share)/, '').trim()}
                        </p>
                      </div>
                    </div>

                    {/* Simplified Connection Info - Single Line */}
                    <div className="mb-6">
                      {intro.mutuals.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex -space-x-1">
                            {intro.mutuals.map((mutual, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-white flex items-center justify-center text-xs font-semibold text-primary shadow-sm">
                                {mutual.avatar}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {intro.mutuals.map(m => m.name).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-500 font-medium">
                            {intro.connectionDegrees} {intro.connectionDegrees === 1 ? 'degree' : 'degrees'} of connection away
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                      {intro.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 px-3 py-1 text-sm font-medium hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action buttons */}
                    {!isConnected && !isSkipped && (
                      <div className="space-y-3 mt-auto">
                        <Button 
                          onClick={() => handleConnect(intro.id)}
                          className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Connect & Say Hi
                        </Button>
                        <Button 
                          onClick={() => handleSkip(intro.id)}
                          variant="outline" 
                          className="w-full h-9 text-sm rounded-xl text-gray-600 border-gray-200 hover:bg-gray-50 transition-all"
                        >
                          Not feeling it
                        </Button>
                      </div>
                    )}

                    {/* Status indicators */}
                    {isConnected && (
                      <div className="text-center py-4 mt-auto">
                        <div className="inline-flex items-center gap-2 text-primary font-semibold bg-primary/10 px-4 py-2 rounded-xl text-base">
                          <CheckCircle className="w-5 h-5" />
                          Connected!
                        </div>
                      </div>
                    )}

                    {isSkipped && (
                      <div className="text-center py-4 mt-auto">
                        <div className="inline-flex items-center gap-2 text-gray-500 font-medium text-base">
                          <X className="w-5 h-5" />
                          Skipped
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer Message */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-gray-700 font-medium text-sm">
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
  );
};

export default Connect;
