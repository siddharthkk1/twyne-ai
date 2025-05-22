
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, MessageCircle, Heart } from "lucide-react";

export interface InsightCardProps {
  insight: string;
  index: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, index }) => {
  // Determine which icon to show based on index
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <MessageCircle className="h-6 w-6 text-primary" />;
      case 1:
        return <Heart className="h-6 w-6 text-primary" />;
      default:
        return <Lightbulb className="h-6 w-6 text-primary" />;
    }
  };
  
  // Determine title based on index
  const getTitle = (index: number) => {
    switch (index) {
      case 0:
        return "How You Connect";
      case 1:
        return "Connection Preferences";
      default:
        return `Personal Insight #${index + 1}`;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0">
            {getIcon(index)}
          </div>
          <div>
            <h4 className="font-medium text-primary mb-1">{getTitle(index)}</h4>
            <p>{insight}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
