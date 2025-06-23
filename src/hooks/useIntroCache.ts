
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CachedIntro {
  id: string;
  introText: string;
  name: string;
  tags: string[];
  mutuals: Array<{ name: string; avatar: string }>;
  connectionDegrees: number;
  gender?: 'male' | 'female';
  avatarId: string;
}

interface IntroCacheData {
  intros: CachedIntro[];
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'twyne_intro_cache';

export const useIntroCache = () => {
  const [hasCachedData, setHasCachedData] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const previousLocation = useRef(location.pathname);
  const previousUserId = useRef(user?.id);
  
  // Check if we have valid cached data on mount and location changes
  useEffect(() => {
    try {
      const cachedString = sessionStorage.getItem(CACHE_KEY);
      if (cachedString) {
        const cached: IntroCacheData = JSON.parse(cachedString);
        const now = Date.now();
        const isExpired = now - cached.timestamp > CACHE_DURATION;
        
        if (!isExpired && cached.intros && cached.intros.length > 0) {
          setHasCachedData(true);
          console.log('✅ Valid cached intros found in sessionStorage');
        } else {
          console.log('⏰ Cached intros expired, clearing');
          sessionStorage.removeItem(CACHE_KEY);
          setHasCachedData(false);
        }
      } else {
        setHasCachedData(false);
      }
    } catch (error) {
      console.error('❌ Error reading intro cache:', error);
      sessionStorage.removeItem(CACHE_KEY);
      setHasCachedData(false);
    }
  }, [location.pathname]);

  // Track route changes to detect navigation away from Connect page
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousLocation.current;
    
    console.log('🔄 Route change detected:', { previousPath, currentPath });
    
    // If we're navigating away from Connect page, clear cache
    if (previousPath === '/connect' && currentPath !== '/connect') {
      console.log('📤 Navigating away from Connect page, clearing cache');
      clearCache();
    }
    
    previousLocation.current = currentPath;
  }, [location.pathname]);

  // Track user changes (logout/login) to clear cache
  useEffect(() => {
    const currentUserId = user?.id;
    const previousUserId_value = previousUserId.current;
    
    // If user changed (logout or different user login), clear cache
    if (previousUserId_value && currentUserId !== previousUserId_value) {
      console.log('👤 User changed, clearing intro cache');
      clearCache();
    }
    
    previousUserId.current = currentUserId;
  }, [user?.id]);

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
    try {
      const cachedString = sessionStorage.getItem(CACHE_KEY);
      if (!cachedString) {
        console.log('💨 No cached intro data found');
        return null;
      }

      const cached: IntroCacheData = JSON.parse(cachedString);
      const now = Date.now();
      const isExpired = now - cached.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        console.log('⏰ Cached intros expired');
        clearCache();
        return null;
      }

      if (!cached.intros || cached.intros.length === 0) {
        console.log('📭 Cached data exists but no intros found');
        return null;
      }

      console.log('✅ Using cached intros:', cached.intros.length);
      return cached.intros;
    } catch (error) {
      console.error('❌ Error reading cached intros:', error);
      clearCache();
      return null;
    }
  };

  const setCachedIntros = (intros: CachedIntro[]) => {
    try {
      const cacheData: IntroCacheData = {
        intros,
        timestamp: Date.now()
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setHasCachedData(true);
      console.log('💾 Cached intros to sessionStorage:', intros.length);
    } catch (error) {
      console.error('❌ Error caching intros:', error);
      setHasCachedData(false);
    }
  };

  const clearCache = () => {
    try {
      sessionStorage.removeItem(CACHE_KEY);
      setHasCachedData(false);
      console.log('🗑️ Cleared intro cache from sessionStorage');
    } catch (error) {
      console.error('❌ Error clearing intro cache:', error);
    }
  };

  return {
    getCachedIntros,
    setCachedIntros,
    clearCache,
    hasCachedData
  };
};
