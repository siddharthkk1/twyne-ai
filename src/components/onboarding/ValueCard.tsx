
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ValueCardProps {
  value: string;
  index: number;
}

export const ValueCard: React.FC<ValueCardProps> = ({ value, index }) => {
  // Different gradient backgrounds based on index
  const gradients = [
    "bg-gradient-to-r from-primary/20 to-primary/5",
    "bg-gradient-to-r from-secondary/20 to-secondary/5",
    "bg-gradient-to-r from-accent/20 to-accent/5",
  ];

  // Select gradient based on index, loop if more than available gradients
  const gradient = gradients[index % gradients.length];
  
  return (
    <Card className={`${gradient} border-none shadow-sm`}>
      <CardContent className="pt-6">
        <div className="flex items-start">
          <div 
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm mr-4"
          >
            <span className="font-semibold text-primary">#{index + 1}</span>
          </div>
          <p className="text-foreground font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueCard;
