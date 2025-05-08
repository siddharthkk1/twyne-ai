
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

interface ConnectionProps {
  id: string;
  name: string;
  description: string;
  matchReason: string;
  imageUrl: string;
  isNew: boolean;
}

const ConnectionCard = ({ id, name, description, matchReason, imageUrl }: ConnectionProps) => {
  return (
    <div className="bg-background rounded-2xl p-4 shadow-sm animate-fade-in">
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

      <div className="flex space-x-2">
        <Button 
          asChild 
          variant="outline"
          className="flex-1 rounded-full"
        >
          <Link to={`/chat/${id}`}>
            <MessageCircle size={18} className="mr-2" />
            Say Hi
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 rounded-full text-muted-foreground"
        >
          Not Now
        </Button>
      </div>
    </div>
  );
};

export default ConnectionCard;
