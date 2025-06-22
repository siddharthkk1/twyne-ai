
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface CachedIntro {
  id: string;
  introText: string;
  name: string;
  tags: string[];
  mutuals: Array<{ name: string; avatar: string }>;
  connectionDegrees: number;
}

interface IntroCacheData {
  intros: CachedIntro[];
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useIntroCache = () => {
  const [cachedData, setCachedData] = useState<IntroCacheData | null>(null);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const location = useLocation();
  const previousLocation = useRef(location.pathname);
  
  // Track route changes to detect navigation away from Connect page
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousLocation.current;
    
    console.log('🔄 Route change detected:', { previousPath, currentPath });
    
    // If we're navigating away from Connect page, mark for cleanup
    if (previousPath === '/connect' && currentPath !== '/connect') {
      console.log('📤 Navigating away from Connect page, will clear cache');
      setIsNavigatingAway(true);
    }
    
    // If we're navigating to Connect page from somewhere else, reset navigation flag
    if (previousPath !== '/connect' && currentPath === '/connect') {
      console.log('📥 Navigating to Connect page');
      setIsNavigatingAway(false);
    }
    
    previousLocation.current = currentPath;
  }, [location.pathname]);

  // Clear cache when navigating away (not on tab switches)
  useEffect(() => {
    if (isNavigatingAway && location.pathname !== '/connect') {
      console.log('🗑️ Clearing intro cache due to navigation away from Connect');
      setCachedData(null);
      setIsNavigatingAway(false);
    }
  }, [isNavigatingAway, location.pathname]);

  // Handle page visibility changes (tab switches) - preserve cache
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible - keeping intro cache');
      } else {
        console.log('👁️ Tab became hidden - keeping intro cache');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getCachedIntros = (): CachedIntro[] | null => {
    if (!cachedData) {
      console.log('💨 No cached intro data found');
      return null;
    }

    const now = Date.now();
    const isExpired = now - cachedData.timestamp > CACHE_DURATION;
    
    if (isExpired) {
      console.log('⏰ Cached intros expired');
      setCachedData(null);
      return null;
    }

    console.log('✅ Using cached intros:', cachedData.intros.length);
    return cachedData.intros;
  };

  const setCachedIntros = (intros: CachedIntro[]) => {
    const cacheData: IntroCacheData = {
      intros,
      timestamp: Date.now()
    };
    console.log('💾 Caching intros:', intros.length);
    setCachedData(cacheData);
  };

  const clearCache = () => {
    console.log('🗑️ Manually clearing intro cache');
    setCachedData(null);
  };

  return {
    getCachedIntros,
    setCachedIntros,
    clearCache,
    hasCachedData: !!cachedData
  };
};
