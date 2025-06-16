
import React, { useState, useEffect } from "react";

interface AIAvatarProps {
  name: string;
  size?: number;
  avatarId?: string;
}

export const AIAvatar = ({ name, size = 80, avatarId }: AIAvatarProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use local Supabase storage URLs for better performance
  const avatarUrl = avatarId 
    ? `https://lzwkccarbwokfxrzffjd.supabase.co/storage/v1/object/public/avatar-images/${avatarId}.png`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // Add debugging
  console.log(`🎭 AIAvatar for ${name}:`, {
    avatarId,
    avatarUrl,
    hasAvatarId: !!avatarId,
    willUseSupabase: !!avatarId
  });

  // Preload the image for better performance
  useEffect(() => {
    if (avatarId) {
      console.log(`🔄 Preloading Supabase avatar for ${name}: ${avatarUrl}`);
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Supabase avatar loaded successfully for ${name}`);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.log(`❌ Supabase avatar failed to load for ${name}, URL: ${avatarUrl}`);
        setImageError(true);
      };
      img.src = avatarUrl;
    } else {
      console.log(`🎨 Using Dicebear avatar for ${name} (no avatarId provided)`);
      // SVG avatars load instantly
      setImageLoaded(true);
    }
  }, [avatarUrl, avatarId, name]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`💥 Image error for ${name}, falling back to Dicebear. Original URL: ${e.currentTarget.src}`);
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
        src={imageError
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
          : avatarUrl}
        alt={`${name}'s avatar`}
        className={`w-[130%] h-[130%] -translate-y-[10%] object-cover transition-opacity duration-300 ${
          imageLoaded || imageError || !avatarId ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          objectPosition: 'center top',
        }}
        onError={handleImageError}
        onLoad={() => {
          console.log(`🖼️ Image onLoad fired for ${name}`);
          setImageLoaded(true);
        }}
        loading="eager"
/>

    </div>
  );
};
