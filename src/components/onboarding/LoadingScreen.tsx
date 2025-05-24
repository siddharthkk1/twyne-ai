
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-12">
    <div className="relative">
      <Loader className="h-12 w-12 text-primary animate-spin" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span className="h-4 w-4 bg-background rounded-full block"></span>
      </div>
    </div>
    <h2 className="text-xl font-medium">Generating your insights</h2>
    <p className="text-muted-foreground text-center max-w-md">
      Building your personal insights based on our conversation. This helps Twyne match you with meaningful connections.
    </p>
  </div>
);

export default LoadingScreen;
