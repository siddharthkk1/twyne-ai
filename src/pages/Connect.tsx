
import React, { useState, useEffect } from "react";
import { MessageCircle, X, Users, CheckCircle, MapPin, Sparkles, Info } from "lucide-react";
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

const STORAGE_KEY = 'connect_page_intros';
const STORAGE_TIMESTAMP_KEY = 'connect_page_intros_timestamp';
const STORAGE_DURATION = 30 * 60 * 1000; // 30 minutes

const Connect = () => {
  const { user } = useAuth();
  const [connectedCards, setConnectedCards] = useState<Set<string>>(new Set());
  const [skippedCards, setSkippedCards] = useState<Set<string>>(new Set());
  const [sampleIntros, setSampleIntros] = useState<SampleIntro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load intros from storage or generate new ones
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadOrGenerateIntros = async () => {
      console.log('🔄 Connect: Starting intro loading/generation for user:', user.id);
      
      // Check if we have valid stored intros
      const storedIntros = sessionStorage.getItem(STORAGE_KEY);
      const storedTimestamp = sessionStorage.getItem(STORAGE_TIMESTAMP_KEY);
      
      if (storedIntros && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp);
        const now = Date.now();
        
        // Check if stored intros are still valid (within 30 minutes)
        if (now - timestamp < STORAGE_DURATION) {
          console.log('✅ Connect: Using stored intros from sessionStorage');
          try {
            const parsedIntros = JSON.parse(storedIntros);
            const introsWithAvatars = parsedIntros.map((intro: any, index: number) => ({
              ...intro,
              avatar: <AIAvatar name={intro.name} size={80} avatarId={getRandomAvatarId(index)} />
            }));
            setSampleIntros(introsWithAvatars);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('❌ Connect: Error parsing stored intros:', parseError);
            // Continue to generate new intros if parsing fails
          }
        } else {
          console.log('⏰ Connect: Stored intros expired, generating new ones');
        }
      } else {
        console.log('💫 Connect: No stored intros found, generating new ones');
      }

      // Generate new intros
      await generateNewIntros();
    };

    loadOrGenerateIntros();
  }, [user?.id]);

  const generateNewIntros = async () => {
    console.log('🚀 Connect: Generating new intros for user:', user?.id);
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Connect: Calling supabase generate-intros function...');
      
      const { data, error } = await supabase.functions.invoke('generate-intros', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      console.log('📡 Connect: Supabase function response:', { data, error });

      if (error) {
        console.error('❌ Connect: Error generating intros:', error);
        throw new Error(error.message || 'Failed to generate intros');
      }

      if (data?.scenarios && Array.isArray(data.scenarios) && data.scenarios.length > 0) {
        console.log('✅ Connect: Successfully generated intros:', data.scenarios);
        const intros = data.scenarios.map((scenario: any, index: number) => ({
          id: (index + 1).toString(),
          introText: scenario.introText,
          name: scenario.name,
          tags: scenario.tags || ['Great match', 'Similar interests', 'Good vibes'],
          mutuals: generateMockMutuals(index),
          connectionDegrees: Math.floor(Math.random() * 3) + 2
        }));
        
        // Store intros in sessionStorage
        const introsForStorage = intros.map(intro => ({
          ...intro,
          avatar: null // Don't store React components
        }));
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(introsForStorage));
        sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
        
        // Add avatars for display
        const introsWithAvatars = intros.map((intro, index) => ({
          ...intro,
          avatar: <AIAvatar name={intro.name} size={80} avatarId={getRandomAvatarId(index)} />
        }));
        
        console.log('💾 Connect: Stored intros in sessionStorage');
        setSampleIntros(introsWithAvatars);
      } else {
        console.log('⚠️ Connect: No valid scenarios in response, using fallback');
        setSampleIntros(getFallbackIntros());
      }

    } catch (error) {
      console.error('💥 Connect: Exception generating intros:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate intros');
      setSampleIntros(getFallbackIntros());
    } finally {
      setLoading(false);
    }
  };

  // Clear stored intros when component unmounts (user leaves the page)
  useEffect(() => {
    return () => {
      console.log('🧹 Connect: Component unmounting, clearing intro session storage');
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_TIMESTAMP_KEY);
    };
  }, []);

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

  const getRandomAvatarId = (index: number): string => {
    const availableAvatarFiles = [
      "man1", "man2", "man3",
      "woman1", "woman2", "woman3", "woman4", "woman5", "woman6"
    ];
    
    const shuffled = [...availableAvatarFiles].sort(() => 0.5 - Math.random());
    return shuffled[index % shuffled.length];
  };

  const getFallbackIntros = (): SampleIntro[] => {
    console.log('🔧 Connect: Generating fallback intros');
    return [
      {
        id: "1",
        introText: "You and Alex recently moved to a new city and care deeply about growth over goals.",
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
        introText: "You and Sam share a love for deep conversations and both value authenticity over small talk.",
        avatar: <AIAvatar name="Sam" size={80} avatarId={getRandomAvatarId(1)} />,
        tags: ["Introspective extrovert", "Deep thinker", "Authentic"],
        name: "Sam",
        mutuals: [],
        connectionDegrees: 3
      },
      {
        id: "3",
        introText: "You and Jordan both find energy in creative projects and believe in following your curiosity.",
        avatar: <AIAvatar name="Jordan" size={80} avatarId={getRandomAvatarId(2)} />,
        tags: ["Creative soul", "Curious explorer", "Project lover"],
        name: "Jordan",
        mutuals: [
          { name: "Chris", avatar: "C" }
        ],
        connectionDegrees: 2
      }
    ];
  };

  const handleConnect = (cardId: string) => {
    console.log('💖 Connect: Connecting to card:', cardId);
    setConnectedCards(prev => new Set([...prev, cardId]));
  };

  const handleSkip = (cardId: string) => {
    console.log('⏭️ Connect: Skipping card:', cardId);
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

  // Loading state
  if (loading) {
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
            Crafting your introductions...
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center pt-16">
        <div className="text-center max-w-md mx-auto px-8 py-16">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="rounded-xl">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-16 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Sample Notice */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl text-sm font-medium mb-6 shadow-sm">
            <Info className="w-4 h-4" />
            <span>Sample Preview: These are examples of the personalized introductions you'll receive.</span>
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

        {/* Cards Grid */}
        {sampleIntros.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {sampleIntros.map((intro) => {
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
                    {/* Avatar and Name Layout */}
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
                          {intro.introText}
                        </p>
                      </div>
                    </div>

                    {/* Connection Info */}
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
