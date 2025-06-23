
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Shield, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user) {
      navigate("/mirror");
    } else {
      navigate("/");
    }
  };

  const getBackButtonText = () => {
    return user ? "Back to Mirror" : "Back to Home";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button
            onClick={handleBack}
            variant="outline"
            className="mb-4 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getBackButtonText()}
          </Button>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              About Twyne
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              AI-powered authentic connections in your city
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                We believe meaningful connections shouldn't be left to chance. Twyne uses AI to understand who you really are and helps you find genuine friendships and relationships in your city.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                Through natural conversations, our AI builds a comprehensive understanding of your personality, interests, and values. Then we match you with compatible people nearby.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Privacy First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                Your data is encrypted and never shared without explicit consent. You control what information is visible to potential connections and can adjust privacy settings anytime.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Real Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                No swiping, no games. Just authentic matches based on deep compatibility. Whether you're looking for friends, dating, or professional connections.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>The Story Behind Twyne</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              Twyne was born from a simple observation: the best connections happen when people truly understand each other. Traditional dating apps focus on photos and brief profiles, but real compatibility runs much deeper.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Our AI doesn't just match based on shared interests—it understands communication styles, life goals, values, and the subtle nuances that make relationships work. The result is connections that feel natural and meaningful from the very first conversation.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We're building a world where technology enhances human connection rather than replacing it, where algorithms serve authentic relationships rather than engagement metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
