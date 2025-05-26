
import React from 'react';

interface HumanAvatar3DProps {
  className?: string;
}

const HumanAvatar3D: React.FC<HumanAvatar3DProps> = ({ className = "" }) => {
  return (
    <div className={`w-full h-64 rounded-lg overflow-hidden border bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center ${className}`}>
      <img 
        src="/lovable-uploads/68a274e6-f0d4-456d-9118-af4701073af0.png" 
        alt="3D Avatar" 
        className="h-full w-auto object-contain"
      />
    </div>
  );
};

export default HumanAvatar3D;
