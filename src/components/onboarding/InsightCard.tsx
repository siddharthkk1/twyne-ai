
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface InsightCardProps {
  insight: string;
  index: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, index }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-primary mb-1">Personal Insight #{index + 1}</h4>
            <p>{insight}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
