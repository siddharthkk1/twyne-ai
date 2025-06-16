
import React, { useState, useEffect } from "react";

interface AIAvatarProps {
  name: string;
  size?: number;
  avatarId?: string;
}

export const AIAvatar = ({ name, size = 80, avatarId }: AIAvatarProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use smaller, optimized image size for better performance
  const avatarUrl = avatarId 
    ? `https://models.readyplayer.me/${avatarId}.png?quality=medium&width=200&height=200&crop=head`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // Preload the image for better performance
  useEffect(() => {
    if (avatarId) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = avatarUrl;
    } else {
      // SVG avatars load instantly
      setImageLoaded(true);
    }
  }, [avatarUrl, avatarId]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Avatar failed to load for ${name}, falling back to Dicebear`);
    setImageError(true);
    const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      name
    )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    e.currentTarget.src = fallbackUrl;
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg ring-2 ring-white/50 relative bg-gray-100 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Loading state */}
      {!imageLoaded && !imageError && avatarId && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Avatar image */}
      <img
        src={imageError ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf` : avatarUrl}
        alt={`${name}'s avatar`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded || imageError || !avatarId ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={() => setImageLoaded(true)}
        loading="eager"
      />
    </div>
  );
};
