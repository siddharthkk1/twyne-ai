
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConnectionProps {
  id: string;
  name: string;
  description: string;
  matchReason: string;
  imageUrl: string;
  isNew: boolean;
}

const ConnectionCard = ({ id, name, description, matchReason, imageUrl, isNew }: ConnectionProps) => {
  return (
    <div className="bg-background rounded-2xl p-4 shadow-sm animate-fade-in border border-border/30">
      {isNew && (
        <Badge variant="secondary" className="mb-3">
          New Introduction
        </Badge>
      )}
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-16 w-16 rounded-full overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="bg-muted rounded-xl p-3 mb-4">
        <p className="text-sm">
          <span className="font-medium">Why you might click:</span>{" "}
          {matchReason}
        </p>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
        <Eye size={14} /> Connect to see full compatibility profile
      </p>

      <div className="flex flex-col gap-3">
        <Button 
          asChild 
          className="w-full rounded-full py-6 text-base font-medium shadow-sm hover:shadow-md transition-all"
          size="lg"
        >
          <Link to={`/chat/${id}`}>
            <MessageCircle size={20} className="mr-2" />
            Connect & Say Hi
          </Link>
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full rounded-full text-muted-foreground"
        >
          Not Interested
        </Button>
      </div>
    </div>
  );
};

export default ConnectionCard;
