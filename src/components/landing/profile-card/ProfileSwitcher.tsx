
import React from "react";

interface ProfileSwitcherProps {
  activeProfile: number;
  totalProfiles: number;
  onProfileChange: (index: number) => void;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ 
  activeProfile, 
  totalProfiles, 
  onProfileChange 
}) => {
  return (
    <div className="flex justify-center space-x-3 mt-0 mb-4">
      {Array.from({ length: totalProfiles }).map((_, index) => (
        <button 
          key={index}
          onClick={() => onProfileChange(index)}
          className={`h-3 w-3 rounded-full transition-all ${
            activeProfile === index ? 'bg-primary scale-125' : 'bg-muted'
          }`}
          aria-label={`View profile ${index + 1}`}
        />
      ))}
    </div>
  );
};
